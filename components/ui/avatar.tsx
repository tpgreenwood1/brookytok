import { cn, getInitials } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: { className: "w-8 h-8 text-xs", px: 32 },
  md: { className: "w-10 h-10 text-sm", px: 40 },
  lg: { className: "w-16 h-16 text-xl", px: 64 },
  xl: { className: "w-20 h-20 text-2xl", px: 80 },
};

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const { className: sizeClass, px } = sizeMap[size];

  if (src) {
    return (
      <div
        className={cn(
          "rounded-full overflow-hidden flex-shrink-0",
          sizeClass,
          className
        )}
      >
        <Image
          src={src}
          alt={name}
          width={px}
          height={px}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-brand to-brand-hover text-white font-semibold select-none",
        sizeClass,
        className
      )}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}
