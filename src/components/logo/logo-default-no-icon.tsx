import { Chip } from '@nextui-org/react';
import { logo } from '../primitives';

export default function DefaultLogoNoIcon(params: { tag: boolean }) {
  const proChip = (tag: boolean)  => {
    if (tag) {
      return (
        <Chip
          style={{
            verticalAlign: "middle",
            fontSize: "0.5rem", // Smaller font size
            padding: "0", // Smaller padding
            height: "1rem"
          }}
          variant="flat">PRO</Chip>
      )
    }

    return (<div></div>)
  }

  return (
    <div style={{ display: "inline-block", verticalAlign: "middle" }}><span className={logo()}>Leet</span>
      <span className={logo({ color: "cyan" })}>Gaming </span>
      {proChip(params.tag)}
    </div>
  )
}