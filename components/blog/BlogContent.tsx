type BlogContentProps = {
  content: string;
};

export default function BlogContent({
  content,
}: BlogContentProps) {
  const blocks =
    content
      .split("\n")
      .map(
        (line) =>
          line.trim(),
      );

  return (
    <div className="space-y-5 text-base leading-8 text-slate-700">
      {blocks.map(
        (
          line,
          index,
        ) => {
          if (!line) {
            return (
              <div
                key={
                  index
                }
                className="h-1"
              />
            );
          }

          if (
            line.startsWith(
              "### ",
            )
          ) {
            return (
              <h3
                key={
                  index
                }
                className="pt-4 text-xl font-black text-slate-950"
              >
                {line.replace(
                  "### ",
                  "",
                )}
              </h3>
            );
          }

          if (
            line.startsWith(
              "## ",
            )
          ) {
            return (
              <h2
                key={
                  index
                }
                className="pt-6 text-2xl font-black text-slate-950"
              >
                {line.replace(
                  "## ",
                  "",
                )}
              </h2>
            );
          }

          if (
            line.startsWith(
              "- ",
            )
          ) {
            return (
              <div
                key={
                  index
                }
                className="flex gap-3"
              >
                <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#922424]" />

                <p>
                  {line.replace(
                    "- ",
                    "",
                  )}
                </p>
              </div>
            );
          }

          return (
            <p
              key={index}
            >
              {line}
            </p>
          );
        },
      )}
    </div>
  );
}