import React, { useState, useRef } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { UploadCloud, X, Loader2, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  onUploadComplete: (urls: string[]) => void;
  folder?: string;
  maxFiles?: number;
}

export function ImageUploader({ onUploadComplete, folder = "products", maxFiles = 5 }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith("image/"));
    
    if (imageFiles.length === 0) {
      toast({
        title: "Invalid file type",
        description: "Please upload image files only.",
        variant: "destructive"
      });
      return;
    }

    if (imageFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload up to ${maxFiles} images at once.`,
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    const uploadPromises = imageFiles.map((file) => {
      return new Promise<void>((resolve, reject) => {
        const fileId = Math.random().toString(36).substring(7);
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
        const storageRef = ref(storage, `${folder}/${fileName}`);
        
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
          },
          (error) => {
            console.error("Upload error:", error);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            uploadedUrls.push(downloadURL);
            resolve();
          }
        );
      });
    });

    try {
      await Promise.all(uploadPromises);
      onUploadComplete(uploadedUrls);
      toast({
        title: "Upload Successful",
        description: `Successfully uploaded ${uploadedUrls.length} image(s).`,
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your images.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress({});
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
          isDragging 
            ? "border-brand-accent bg-brand-accent/5" 
            : "border-border/50 hover:border-brand-accent/50 hover:bg-muted/30"
        } ${isUploading ? "pointer-events-none opacity-80" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          accept="image/*"
          onChange={handleFileInput}
        />
        
        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center space-y-4 w-full"
            >
              <Loader2 className="h-10 w-10 text-brand-accent animate-spin" />
              <div className="text-sm font-medium text-foreground">
                Uploading images...
              </div>
              <div className="w-full max-w-xs space-y-2">
                {Object.entries(uploadProgress).map(([id, progress]) => (
                  <div key={id} className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-accent transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center space-y-3"
            >
              <div className="p-3 bg-secondary rounded-full">
                <UploadCloud className="h-6 w-6 text-foreground/70" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Click or drag and drop to upload
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  SVG, PNG, JPG or GIF (max {maxFiles} files)
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
