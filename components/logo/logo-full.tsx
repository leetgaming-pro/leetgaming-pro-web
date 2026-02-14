import { Image } from "@nextui-org/react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function FullLogo(params: any) {
  return (
    <div style={{ textAlign: "center" }}>
      {/* <DefaultLogoOnlyIcon />
      <DefaultLogoNoIcon tag={true}  /> */}
      <Image
        src="/logo-red-full.png"
        width={225}
        alt="Gameplay Screenshot"
        {...params}
      />
    </div>
  );
}
