import { Input } from '@nextui-org/react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export interface AvatarUploaderProps {
    onUpload?: (file: File) => void;
    onAvatarChange?: (file: File) => void;
    currentAvatarUrl?: string;
    size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
    sm: { width: 64, height: 64 },
    md: { width: 96, height: 96 },
    lg: { width: 128, height: 128 },
};

const AvatarUploader: React.FC<AvatarUploaderProps> = ({ 
    onUpload, 
    onAvatarChange,
    currentAvatarUrl,
    size = 'md'
}) => {
    const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null);
    const dimensions = sizeClasses[size];

    useEffect(() => {
        if (currentAvatarUrl) {
            setPreview(currentAvatarUrl);
        }
    }, [currentAvatarUrl]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            onUpload?.(file);
            onAvatarChange?.(file);
        }
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '50%', width: dimensions.width, height: dimensions.height }}>
            <Image 
                src={preview || '/logo_leetgaming-big-g.png'} 
                alt="Avatar Preview" 
                width={120}
                height={120}
                style={{ borderRadius: '50%', width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            <label style={{ cursor: 'pointer', display: 'inline-block', border: '1px solid #ccc', borderRadius: '25%', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'rgba(255, 255, 255, 0.7)', zIndex: 1 }}>
                Upload
                <Input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
        </div>
    );
};

export default AvatarUploader;