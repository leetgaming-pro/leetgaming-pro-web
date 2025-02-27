import { IconSvgProps } from '@/types';
import React from 'react';
import type { SVGProps } from 'react';

export function GameIconsAerodynamicHarpoon(props: SVGProps<SVGSVGElement>) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 512 512" {...props}><path fill="currentColor" d="M18.285 16.297v20.52L127.088 163.57c35.955 91.222 6.358 156.645-59.43 178.098l111.852 34.758c6.88-3.465 12.225-7.756 17.69-12.64c38.677-34.554 39.72-103.556-23.38-190.208c98.413 71.66 174.565 60.578 202.85 5.686L342.545 66.78c-21.29 65.28-86.246 95.3-176.545 60.794L36.908 16.297zM401.998 221.48c-18.06 55.37-84.184 71.942-172.205 7.846c64.098 88.022 47.94 153.736-7.432 171.79l73.095 22.714c4.504-2.256 8.003-5.05 11.566-8.252l-.002-.006c25.274-22.58 25.955-67.676-15.28-124.302c64.31 46.833 114.076 39.59 132.56 3.716L402 221.48zm41.68 114.366c-10.75 32.968-50 42.71-102.408 4.545c38.163 52.41 28.42 91.66-4.55 102.41l153.8 46.843l-46.84-153.797h-.002z"></path></svg>);
}

export const QuestionIcon: React.FC<IconSvgProps> = ({width = "1em", height = "1em", size = 24, ...props}) => {
  return (
<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2s10 4.477 10 10M12 7.75c-.621 0-1.125.504-1.125 1.125a.75.75 0 0 1-1.5 0a2.625 2.625 0 1 1 4.508 1.829q-.138.142-.264.267a7 7 0 0 0-.571.617c-.22.282-.298.489-.298.662V13a.75.75 0 0 1-1.5 0v-.75c0-.655.305-1.186.614-1.583c.229-.294.516-.58.75-.814q.106-.105.193-.194A1.125 1.125 0 0 0 12 7.75M12 17a1 1 0 1 0 0-2a1 1 0 0 0 0 2" clipRule="evenodd"></path></svg>

  );
};

export const NetworkFavorite: React.FC<IconSvgProps> = ({width = "1em", height = "1em", size = 24, ...props}) => {
	return (
<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size}  viewBox="0 0 24 24"><path fill="currentColor" d="M12 6C8.6 6 5.5 7.1 3 9L1.2 6.6C4.2 4.3 8 3 12 3s7.8 1.3 10.8 3.6L21 9c-2.5-1.9-5.6-3-9-3m1 13c0-1.3.4-2.6 1.2-3.6c-.7-.2-1.4-.4-2.2-.4c-1.3 0-2.6.5-3.6 1.2L12 21l1-1.4zm3.8-5.6c.3-.1.7-.2 1.1-.3l1.3-1.7C17.2 9.9 14.7 9 12 9s-5.2.9-7.2 2.4l1.8 2.4C8.1 12.7 10 12 12 12c1.8 0 3.4.5 4.8 1.4m-.3 9.2l.7-2.8l-2.2-1.9l2.9-.2L19 15l1.1 2.6l2.9.2l-2.2 1.9l.7 2.8l-2.5-1.4z"></path></svg>
	);
  };


