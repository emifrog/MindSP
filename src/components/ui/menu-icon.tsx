import { cn } from "@/lib/utils";

interface MenuIconProps {
  className?: string;
  size?: number;
}

export function MenuIcon({ className, size = 24 }: MenuIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 512 512"
      className={cn("inline-block", className)}
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeMiterlimit="10"
        strokeWidth="48"
        d="M88 152h336M88 256h336M88 360h336"
      />
    </svg>
  );
}
