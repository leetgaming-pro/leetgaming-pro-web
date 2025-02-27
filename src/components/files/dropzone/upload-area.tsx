/* eslint-disable react/no-unescaped-entities */

import { Accept, useDropzone } from "react-dropzone";
import { Icon } from "@iconify/react";
import { Button, Spacer } from "@nextui-org/react";
import { useCallback, useEffect } from "react";
import uploadConfig from "@/config/upload";
import axios, { AxiosProgressEvent, AxiosRequestConfig } from "axios";

export interface AcceptedFile extends File {
    path?: string | undefined;
}

const UploadArea = () => {
    const onDrop = useCallback(async (acceptedFiles: AcceptedFile[]) => {
        const formData = acceptedFiles.reduce((acc, file, index) => {
            const fileName = `${(1_000_000 + index).toString().substring(1)}_${file.name ?? "usercontent"}`;
            acc.append(fileName, file);
            return acc;
        },  new FormData());
    
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

        console.log(acceptedFiles);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: uploadConfig.AcceptedFileExtensions,
        multiple: uploadConfig.AcceptMultipleFilesAtOnce,
    });

    return (
        <div {...getRootProps()}>
            <input {...getInputProps()} />
            {isDragActive ? (
                <p>Drop the files here ...</p>
            ) : (
                <p>Drag 'n' drop some files here, or click to select files</p>
            )}
            <Spacer y={1} />
            <Button>Upload Files</Button>
        </div>
    );
};

export default UploadArea;

function setProgress(arg0: number) {
  throw new Error("Function not implemented.");
}
