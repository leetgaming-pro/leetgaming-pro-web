'use client'

import { Button } from '@nextui-org/button'
import { Input } from '@nextui-org/input'
import { useState } from 'react'

import { Chip, Progress, Spacer } from '@nextui-org/react';
import { SearchIcon } from '../../icons';
import axios, { AxiosProgressEvent, AxiosRequestConfig } from 'axios';

export function UploadForm() {

  const [file, setFile] = useState<File>()
  const [progress, setProgress] = useState(0)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file) return

    try {
      const data = new FormData()
      data.set('file', file)

      const res = await fetch('/api/upload/replay', {
        method: 'POST',
        body: data
      })

      if (!res.ok) throw new Error(await res.text())
    } catch (e: any) {
      console.error(e)
    } 
  }

  const onUploadFile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      return;
    }

    try {
      let formData = new FormData();
      formData.append("file", file);
  
      const options: AxiosRequestConfig = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (!progressEvent.total) {
            setProgress(0);
          }

          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total!
          );
          console.log(`Upload progress: ${percentCompleted}%`);
          setProgress(percentCompleted/2);
        },
      };

      const response = await axios.post("http://localhost:4991/games/csgo/replay", formData, options);

      console.log("Upload successful:", response.data);
      setProgress(100);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (

    <form onSubmit={onUploadFile}>
      <div className="flex w-min-500 flex-col">
        <Input
          startContent={<SearchIcon />}
          // label="Select match replay file"
          placeholder="Select a file..."
          labelPlacement="outside"
          description="Select the match replay file you want to submit."
          type="file"
          name="file"
          variant="faded"
          className='align-baseline'
          // isInvalid={isInvalid}
          // color={isInvalid ? "danger" : "success"}
          // errorMessage={isInvalid && "Please enter a valid email"}
          // onValueChange={setValue}
          onChange={(e) => setFile(e.target.files?.[0])}
        />
        <Progress value={progress} 
                  classNames={{
                    base: "max-w-md",
                    track: "drop-shadow-md border border-default",
                    indicator: "bg-gradient-to-r from-amber-500 to-yellow-500",
                    label: "tracking-wider font-medium text-default-600",
                    value: "text-foreground/60",
                  }}
                  showValueLabel={true}
        />
        <Spacer y={6} />
        {/* <Button radius="full" className="bg-gradient-to-tr from-blue-500 to-cyan-500 text-white shadow-lg">
          Upload
        </Button> */}
      </div>
      <Input type="submit" radius="full" className="bg-gradient-to-tr from-amber-500 to-red-500 text-white shadow-lg" value="" />
    </form>

  )
}