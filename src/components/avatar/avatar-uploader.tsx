import { Input } from '@nextui-org/react';
import { useState } from 'react';

export interface AvatarUploaderProps {
    onUpload: (file: File) => void;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({ onUpload }) => {
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            onUpload(file);
        }
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '50%' }}>
            <img src={preview || '/logo_leetgaming-big-g.png'} alt="Avatar Preview" style={{ borderRadius: '50%' }} />
            <label style={{ cursor: 'pointer', display: 'inline-block', border: '1px solid #ccc', borderRadius: '25%', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'rgba(255, 255, 255, 0.7)', zIndex: 1 }}>
                Upload
                <Input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
        </div>
    );
};

export default AvatarUploader;