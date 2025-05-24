import { useState, useRef } from 'react';
import Image from 'next/image';

interface ProfilePictureProps {
  photoURL: string | null;
  onPhotoUpdate: (url: string) => Promise<void>;
  size?: number;
}

export default function ProfilePicture({ photoURL, onPhotoUpdate, size = 150 }: ProfilePictureProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Only allow image files
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setIsUploading(true);
    try {
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      
      // TODO: Implement Firebase storage upload
      // This should be implemented based on your Firebase configuration
      // const storageRef = ref(storage, `profile-pictures/${userId}/${file.name}`);
      // const uploadTask = uploadBytesResumable(storageRef, file);
      // const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      
      // For now, we'll just use the preview URL
      await onPhotoUpdate(previewUrl);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const defaultImage = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <Image
        src={photoURL || defaultImage}
        alt="Profile picture"
        width={size}
        height={size}
        className="rounded-full object-cover"
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full 
                   hover:bg-blue-700 transition-colors duration-200"
        disabled={isUploading}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {isUploading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full 
                      flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
} 