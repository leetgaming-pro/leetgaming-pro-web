import { Image } from "@nextui-org/react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function DefaultLogo(props: any) {
  return (
    <div style={{ textAlign: "center" }}>
      {/* <DefaultLogoOnlyIcon />
      <DefaultLogoNoIcon tag={true}  /> */}
      <Image
        src="/logo-red-only-text.png"
        alt="LeetGaming Logo"
        style={{
          objectFit: "contain",
          maxWidth: "200px",
          marginTop: "4px",
          marginBottom: "4px",
        }}
        {...props}
      />
      {/* <Chip
        style={{
          verticalAlign: "middle",
          fontSize: "0.5rem", // Smaller font size
          padding: "0", // Smaller padding
          height: "1rem"
        }}
        variant="flat">PRO</Chip> */}
    </div>
  );
}
