import {
  Icon as IconifyIcon,
  type IconProps as IconifyIconProps,
} from "@iconify/react";
import { cn } from "@/lib/utils";

interface IconProps extends Omit<IconifyIconProps, "icon"> {
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
}

const sizeMap = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  "2xl": 40,
};

export function Icon({ name, size = "md", className, ...props }: IconProps) {
  return (
    <IconifyIcon
      icon={name}
      width={sizeMap[size]}
      height={sizeMap[size]}
      className={cn("inline-block flex-shrink-0", className)}
      {...props}
    />
  );
}
