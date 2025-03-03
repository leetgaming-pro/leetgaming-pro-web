import { DefaultLogoOnlyIcon } from './logo-default-only-icon';
import DefaultLogoNoIcon from './logo-default-no-icon';
import { Image } from '@nextui-org/react'

export default function LogoGrayscale(props: any) {
  return (
    <div className='align-center justify-center items-center' style={{ objectFit: "contain", maxWidth: "200px", marginTop: "4px", marginBottom: "4px", textAlign: "center"}}>
      {/* <DefaultLogoOnlyIcon />
      <DefaultLogoNoIcon tag={true}  /> */}
      <Image
            src="/logo-red-full.png"
            alt="Gameplay Screenshot" 
            
            {...props}/>
    </div>
  )
}