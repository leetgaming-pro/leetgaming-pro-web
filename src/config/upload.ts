const mb = 1024 * 1024
const tb = 1024 * mb
const UploadConfig = {
    AcceptMultipleFilesAtOnce: true,
    MaximumFileBytes: 250 * mb,
    MaximumBatchBytes: 1 * tb,
    AcceptedFileExtensions: {
        ["application/octet-stream"]: [".dem", ".dem.info"],
        ["application/*"]: [".dem", ".dem.info"],
    },
    Enabled: () => true,
}

export default UploadConfig
