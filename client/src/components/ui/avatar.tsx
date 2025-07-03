import { getCatAvatarSvg } from "@/lib/cat-avatars";

interface AvatarProps {
  avatarId: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ avatarId, size = "md", className = "" }: AvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  const svgContent = getCatAvatarSvg(avatarId);
  
  return (
    <div 
      className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-gray-200 ${className}`}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}