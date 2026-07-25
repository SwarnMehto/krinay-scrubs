const announcements = [
  "Free shipping on orders above ₹999 across India",
  "For the warriors like you",
  "Comfort that powers every shift",
];

function AnnouncementItems({
  hidden = false,
}: {
  hidden?: boolean;
}) {
  return (
    <div
      className="flex shrink-0 items-center"
      aria-hidden={hidden}
    >
      {announcements.map((announcement, index) => (
        <div
          key={`${announcement}-${index}`}
          className="flex shrink-0 items-center"
        >
          <span className="px-8 text-xs font-semibold tracking-wide text-white sm:px-12 sm:text-sm">
            {announcement}
          </span>

          <span
            className="text-base text-white/70"
            aria-hidden="true"
          >
            ✦
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AnnouncementBar() {
  return (
    <div className="relative w-full overflow-hidden bg-[#922424] py-2.5">
      <div className="announcement-marquee flex w-max items-center whitespace-nowrap">
        <AnnouncementItems />
        <AnnouncementItems hidden />
      </div>

      <style>{`
        @keyframes announcement-scroll {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        .announcement-marquee {
          animation: announcement-scroll 22s linear infinite;
          will-change: transform;
        }

        .announcement-marquee:hover {
          animation-play-state: paused;
        }

        @media (max-width: 640px) {
          .announcement-marquee {
            animation-duration: 17s;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .announcement-marquee {
            animation-play-state: paused;
          }
        }
      `}</style>
    </div>
  );
}