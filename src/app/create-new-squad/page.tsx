'use client';

import {twMerge} from "tailwind-merge";
import ContentWrapper from "@/components/atoms/content-wrapper";
import Typography from "@/components/atoms/typography";
import TextInput from "@/components/atoms/text-input";
import Select from "@/components/atoms/select";
import TextArea from "@/components/atoms/text-area";
import PageBackground from "@/components/atoms/page-background";

export default function CreateNewSquad() {
  const bgImage = 'url(https://cdna.artstation.com/p/assets/images/images/006/916/734/large/jayson-miller-reactor-ms-supplemental-02.jpg?1502230684)';

  return (
    <>
      <PageBackground url={bgImage} />
      <ContentWrapper className="p-10 z-10 gap-10">
        <div className="flex shadow-lg flex-col p-10 gap-4 bg-content1 rounded-lg border border-border">
          <Typography type="h2">Create your squad</Typography>
          <div className="grid grid-cols-2 gap-x-4">
            <TextInput placeholder="Name..." label="Name" onChange={() => null} />
            <Select label="Game" options={[]} placeholder="Select a game..." />
            <TextInput placeholder="Slug..." label="Slug" disabled onChange={() => null} />
            <TextArea containerClassname="row-span-2" placeholder="placeholder..." label="Description" />
            <TextInput placeholder="Symbol..." label="Symbol" onChange={() => null} />
          </div>
        </div>
      </ContentWrapper>
    </>
  )
}
