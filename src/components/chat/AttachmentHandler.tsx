"use client"

import * as React from "react"
import { ImageUploadModal } from "./ImageUploadModal"
import { CameraModal } from "./CameraModal"
import { UploadOptions } from "./UploadOptions"

interface AttachmentHandlerProps {
  onImageUpload: (image: string, prompt?: string) => void;
  isArticlesPage: boolean;
}

/**
 * AttachmentHandler Component
 * 
 * Manages file uploads and image handling functionality for the chat interface.
 * Provides options for uploading files and capturing images through camera.
 * 
 * @component
 * @param {Object} props
 * @param {Function} props.onImageUpload - Callback function to handle image uploads
 * @param {boolean} props.isArticlesPage - Flag to determine if component is rendered on articles page
 */
export function AttachmentHandler({ 
  onImageUpload,
  isArticlesPage
}: AttachmentHandlerProps) {
  // State for managing modals and file handling
  const [isCameraOpen, setIsCameraOpen] = React.useState(false);
  const [imagePromptOpen, setImagePromptOpen] = React.useState(false);
  const [pendingImage, setPendingImage] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Handler for file upload button click
  const handleFileUploadClick = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Handler for file selection
  const handleFileChange = React.useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result?.toString();
        if (base64String) {
          setPendingImage(base64String);
          setImagePromptOpen(true);
        }
      };
      reader.readAsDataURL(file);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error reading file:', error);
    }
  }, []);

  return (
    <>
      {!isArticlesPage && (
        <UploadOptions
          tickets={[]}
          onFileUpload={handleFileUploadClick}
        />
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        aria-hidden="true"
      />

      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(imageSrc) => {
          setIsCameraOpen(false);
          setPendingImage(imageSrc);
          setImagePromptOpen(true);
        }}
      />

      <ImageUploadModal
        isOpen={imagePromptOpen}
        image={pendingImage}
        onClose={() => {
          setImagePromptOpen(false);
          setPendingImage(null);
        }}
        onSubmit={async (prompt) => {
          if (!pendingImage) return;
          setImagePromptOpen(false);
          onImageUpload(pendingImage, prompt);
          setPendingImage(null);
        }}
      />
    </>
  );
}