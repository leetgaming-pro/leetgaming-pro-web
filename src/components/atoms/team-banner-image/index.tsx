interface TeamBannerImageProps {
  source: string;
  bg: string;
}

export default function TeamBannerImage({bg, source}: TeamBannerImageProps) {
  const bgImage = `url(${source})` || '';
  console.log(bgImage);
  console.log(bg);
  return <div
    className={`flex-1 bg-center bg-no-repeat`}
    style={{ backgroundColor: bg, backgroundImage: bgImage }}
  />
}
