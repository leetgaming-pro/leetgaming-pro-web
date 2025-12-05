/* eslint-disable react/no-unescaped-entities */

import { useDropzone } from "react-dropzone";
import { Button, Spacer, Progress } from "@nextui-org/react";
import { useCallback, useState } from "react";
import uploadConfig from "@/config/upload";
import axios, { AxiosProgressEvent, AxiosRequestConfig } from "axios";
import { logger } from "@/lib/logger";

export interface AcceptedFile extends File {
    path?: string | undefined;
}

interface UploadAreaProps {
    onUploadComplete?: (response: unknown) => void;
    uploadEndpoint?: string;
}

const UploadArea = ({ onUploadComplete, uploadEndpoint = "/api/upload" }: UploadAreaProps) => {
    const [progress, setProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback(async (acceptedFiles: AcceptedFile[]) => {
        if (acceptedFiles.length === 0) return;

        setIsUploading(true);
        setError(null);
        setProgress(0);

        const formData = acceptedFiles.reduce((acc, file, index) => {
            const fileName = `${(1_000_000 + index).toString().substring(1)}_${file.name ?? "usercontent"}`;
            acc.append(fileName, file);
            return acc;
        }, new FormData());

        const options: AxiosRequestConfig = {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            if (!progressEvent.total) {
              setProgress(0);
              return;
            }

            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          },
        };

        try {
            const response = await axios.post(uploadEndpoint, formData, options);
            setProgress(100);
            logger.info("Upload successful", { files: acceptedFiles.length });
            onUploadComplete?.(response.data);
        } catch (err) {
            logger.error("Upload failed", err);
            setError("Upload failed. Please try again.");
            setProgress(0);
        } finally {
            setIsUploading(false);
        }
    }, [uploadEndpoint, onUploadComplete]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: uploadConfig.AcceptedFileExtensions,
        multiple: uploadConfig.AcceptMultipleFilesAtOnce,
        disabled: isUploading,
    });

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive ? "border-primary bg-primary/10" : "border-default-300 hover:border-primary"
                } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
                <input {...getInputProps()} />
                {isDragActive ? (
                    <p className="text-primary">Drop the files here ...</p>
                ) : (
                    <p className="text-default-500">Drag 'n' drop some files here, or click to select files</p>
                )}
                <Spacer y={2} />
                <Button color="primary" isDisabled={isUploading}>
                    {isUploading ? "Uploading..." : "Upload Files"}
                </Button>
            </div>

            {isUploading && (
                <div className="mt-4">
                    <Progress
                        value={progress}
                        color="primary"
                        size="sm"
                        showValueLabel
                        className="max-w-full"
                    />
                </div>
            )}

            {error && (
                <p className="mt-2 text-danger text-sm">{error}</p>
            )}
        </div>
    );
};

export default UploadArea;
