// // /app/blog/page.tsx
// "use client";

// import { Card, CardFooter, Accordion, AccordionItem, Image } from '@nextui-org/react';
// import Link from 'next/link';
// import React from 'react';
// // import fs from 'fs';
// // import path from 'path';

// // async function getBlogPostPaths() {
// //   // const postsDirectory = path.join(process.cwd(), 'app/blog');
// //   // const yearDirs = fs.readdirSync(postsDirectory, { withFileTypes: true })
// //   //   .filter((dirent: { isDirectory: () => any; }) => dirent.isDirectory())
// //   //   .map((dirent: { name: any; }) => dirent.name);

  
// //   // yearDirs.forEach((year: any) => {
// //   //   const monthDirs = fs.readdirSync(path.join(postsDirectory, year));
// //   //   monthDirs.forEach((month: any) => {
// //   //     const dayDirs = fs.readdirSync(path.join(postsDirectory, year, month));
// //   //     dayDirs.forEach((day: any) => {
// //   //       const pageFile = fs.readdirSync(path.join(postsDirectory, year, month, day)).find((file: string) => file.endsWith('.tsx'));
// //   //       if (pageFile) {
// //   //         posts.push(`/${year}/${month}/${day}/${pageFile.replace('.tsx', '')}`);
// //   //       }
// //   //     });
// //   //   });
// //   // });

// //   // posts.push();

// //   return posts;
// // }

// export default async function BlogPage() {
//   const posts: string[] = [`/blog/2024/06/05/anything`];
//   const [selectedYear, setSelectedYear] = React.useState(null);

//   const postsByYear = posts.reduce((acc: any, postPath:any) => {
//     const year = postPath.split('/')[1];
//     acc[year] = acc[year] || [];
//     acc[year].push(postPath);
//     return acc;
//   }, {});

//   const latestPost = posts[posts.length - 1]; 

//   return (
//     <div>
//       <section>
//         <h2>Featured Post</h2>
//         <Link href={latestPost}>
//               <Card isHoverable isPressable>
//                 <Image src="/cs2/radar/de_inferno.webp" width="100%" height={200} alt="Featured Post" />
//                 <CardFooter>
//                   <b>{latestPost}</b> {/* Display the post title or extract it from the file */}
//                 </CardFooter>
//               </Card>
//             </Link>
//       </section>

//       <section>
//         <h2>All Posts</h2>
//         <Accordion>
//           {Object.entries(postsByYear).map(([year, yearPosts]) => (
//             <AccordionItem key={year} title={year}>
//               {(yearPosts as any).map((postPath: string) => (
//                 <Link href={postPath} key={postPath}>
//                   <span>{postPath}</span>
//                 </Link>
//               ))}
//             </AccordionItem>
//           ))}
//         </Accordion>
//       </section>
//     </div>
//   );
// }



// ----///-----


import {Card, CardHeader, CardFooter, Image, Button} from "@nextui-org/react";

export default function App() {
  return (
    <div className="max-w-[900px] gap-2 grid grid-cols-12 grid-rows-2 px-8">
      <Card className="col-span-12 sm:col-span-4 h-[300px]">
        <CardHeader className="absolute z-10 top-1 flex-col !items-start">
          <p className="text-tiny text-white/60 uppercase font-bold">What to watch</p>
          <h4 className="text-white font-medium text-large">Stream your match</h4>
        </CardHeader>
        <Image
          removeWrapper
          alt="Card background"
          className="z-0 w-full h-full object-cover"
          src="https://avatars.githubusercontent.com/u/168373383"
        />
      </Card>
      <Card className="col-span-12 sm:col-span-4 h-[300px]">
        <CardHeader className="absolute z-10 top-1 flex-col !items-start">
          <p className="text-tiny text-white/60 uppercase font-bold">Sustainable ecosystem</p>
          <h4 className="text-white font-medium text-large">Contribute to the planet</h4>
        </CardHeader>
        <Image
          removeWrapper
          alt="Card background"
          className="z-0 w-full h-full object-cover"
          src="https://avatars.githubusercontent.com/u/191552475"
        />
      </Card>
      <Card className="col-span-12 sm:col-span-4 h-[300px]">
        <CardHeader className="absolute z-10 top-1 flex-col !items-start">
          <p className="text-tiny text-white/60 uppercase font-bold">Supercharged</p>
          <h4 className="text-white font-medium text-large">Leverage professional e-sports competition</h4>
        </CardHeader>
        <Image
          removeWrapper
          alt="Card background"
          className="z-0 w-full h-full object-cover"
          src="https://avatars.githubusercontent.com/u/168373383"
        />
      </Card>
      <Card isFooterBlurred className="w-full h-[300px] col-span-12 sm:col-span-5">
        <CardHeader className="absolute z-10 top-1 flex-col items-start">
          <p className="text-tiny text-white/60 uppercase font-bold">New</p>
          <h4 className="text-black font-medium text-2xl">Replay-API</h4>
        </CardHeader>
        <Image
          removeWrapper
          alt="Card example background"
          className="z-0 w-full h-full scale-125 -translate-y-6 object-cover"
          src="https://avatars.githubusercontent.com/u/191552475"
        />
        <CardFooter className="absolute bg-white/30 bottom-0 border-t-1 border-zinc-100/50 z-10 justify-between">
          <div>
            <p className="text-black text-tiny">Available soon.</p>
            <p className="text-black text-tiny">Get notified.</p>
          </div>
          <Button className="text-tiny" color="primary" radius="full" size="sm">
            Notify Me
          </Button>
        </CardFooter>
      </Card>
      <Card isFooterBlurred className="w-full h-[300px] col-span-12 sm:col-span-7">
        <CardHeader className="absolute z-10 top-1 flex-col items-start">
          <p className="text-tiny text-white/60 uppercase font-bold">Your day your way</p>
          <h4 className="text-white/90 font-medium text-xl">Your checklist for better sleep</h4>
        </CardHeader>
        <Image
          removeWrapper
          alt="Relaxing app background"
          className="z-0 w-full h-full object-cover"
          src="https://avatars.githubusercontent.com/u/168373383"
        />
        <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
          <div className="flex flex-grow gap-2 items-center">
            <Image
              alt="Breathing app icon"
              className="rounded-full w-10 h-11 bg-black"
              src="https://avatars.githubusercontent.com/u/191552475"
            />
            <div className="flex flex-col">
              <p className="text-tiny text-white/60">Breathing App</p>
              <p className="text-tiny text-white/60">Get a good night&#39;s sleep.</p>
            </div>
          </div>
          <Button radius="full" size="sm">
            Get App
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
