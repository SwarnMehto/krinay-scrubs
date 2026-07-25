import { NextResponse } from "next/server";

import { getCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

const MAX_FILE_SIZE =
  10 * 1024 * 1024;

const allowedMimeTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
]);

function sanitizeFileName(
  fileName: string,
) {
  return fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export async function POST(
  request: Request,
) {
  try {
    const formData =
      await request.formData();

    const file =
      formData.get("file");

    if (
      !file ||
      !(file instanceof File)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Embroidery artwork file required hai.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !allowedMimeTypes.has(
        file.type,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only PNG, JPG, WEBP or PDF files allowed hain.",
        },
        {
          status: 400,
        },
      );
    }

    if (file.size <= 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Uploaded file empty hai.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      file.size > MAX_FILE_SIZE
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Artwork maximum 10 MB ka ho sakta hai.",
        },
        {
          status: 413,
        },
      );
    }

    const bytes =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(bytes);

    const cloudinary =
      getCloudinary();

    const cleanName =
      sanitizeFileName(file.name) ||
      "embroidery-artwork";

    const uploadResult =
      await new Promise<{
        secure_url: string;
        public_id: string;
        resource_type: string;
        format?: string;
        bytes: number;
      }>((resolve, reject) => {
        const uploadStream =
          cloudinary.uploader.upload_stream(
            {
              folder:
                "krinay/embroidery",

              resource_type: "auto",

              public_id: `${Date.now()}-${cleanName}`,

              overwrite: false,

              use_filename: false,
            },
            (error, result) => {
              if (
                error ||
                !result
              ) {
                reject(
                  error ??
                    new Error(
                      "Cloudinary upload failed.",
                    ),
                );

                return;
              }

              resolve({
                secure_url:
                  result.secure_url,

                public_id:
                  result.public_id,

                resource_type:
                  result.resource_type,

                format:
                  result.format,

                bytes:
                  result.bytes,
              });
            },
          );

        uploadStream.end(
          buffer,
        );
      });

    return NextResponse.json(
      {
        success: true,

        message:
          "Embroidery artwork uploaded successfully.",

        file: {
          url:
            uploadResult.secure_url,

          publicId:
            uploadResult.public_id,

          fileName: file.name,

          mimeType: file.type,

          size: file.size,

          resourceType:
            uploadResult.resource_type,

          format:
            uploadResult.format ??
            null,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Embroidery upload error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Artwork upload nahi ho paya.",
      },
      {
        status: 500,
      },
    );
  }
}