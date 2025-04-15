import Image from "next/image";

interface AvatarProps {
  width?: number;
  height?: number;
  src: string;
}
export default function Avatar({src, width = 80, height = 80}: AvatarProps) {
  return (
    <div className="rounded-full w-[80px] h-[80px] overflow-hidden items-center justify-center">
      <Image width={width} height={height} src={src} alt="avatar" />
    </div>
  );
}
