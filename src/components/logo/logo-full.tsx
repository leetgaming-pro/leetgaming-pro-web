import { DefaultLogoOnlyIcon } from './logo-default-only-icon';
import DefaultLogoNoIcon from './logo-default-no-icon';
import { Image } from '@nextui-org/react'

export default function FullLogo(params: any) {
  return (
    <div style={{ textAlign: "center" }}>
      {/* <DefaultLogoOnlyIcon />
      <DefaultLogoNoIcon tag={true}  /> */}
      <Image
            src="/logo-red-full.png"
            width={225}
            alt="Gameplay Screenshot" {...params}/>
    </div>
  )
}