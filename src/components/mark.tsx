import { cn } from "@/lib/utils";

export function FarolMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("text-primary", className)}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M16 4.5 L16 9.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M16 4.5 L22 7.2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M16 4.5 L10 7.2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <rect
        x="13.2"
        y="9.4"
        width="5.6"
        height="13.2"
        rx="0.6"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M14.4 13.2 H17.6 M14.4 16.2 H17.6 M14.4 19.2 H17.6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M11 23.2 H21 L22.4 26.4 H9.6 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
