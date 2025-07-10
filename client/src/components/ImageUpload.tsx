import { useState, useCallback, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ImageUploadProps {
  productId: number;
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

interface UploadingImage {
  id: string;
  file: File;
  progress: number;
  error?: string;
}

export default function ImageUpload({ 
  productId, 
  images, 
  onImagesChange, 
  maxImages = 5,
  disabled = false 
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [disabled]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const files = Array.from(e.target.files || []);
    handleFiles(files);
    
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [disabled]);

  const handleFiles = useCallback((files: File[]) => {
    const remainingSlots = maxImages - images.length - uploadingImages.length;
    const filesToUpload = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      toast({
        title: "Too many files",
        description: `You can only upload ${remainingSlots} more image(s). Maximum ${maxImages} images per product.`,
        variant: "destructive",
      });
    }

    const validFiles = filesToUpload.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB

      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a valid image file.`,
          variant: "destructive",
        });
        return false;
      }

      if (!isValidSize) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 5MB.`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    // Add files to uploading state
    const newUploadingImages: UploadingImage[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
    }));

    setUploadingImages(prev => [...prev, ...newUploadingImages]);

    // Upload each file
    newUploadingImages.forEach(uploadingImage => {
      uploadImage(uploadingImage);
    });
  }, [images.length, uploadingImages.length, maxImages, toast]);

  const uploadImage = async (uploadingImage: UploadingImage) => {
    try {
      const formData = new FormData();
      formData.append('image', uploadingImage.file);
      formData.append('productId', productId.toString());

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadingImages(prev => 
          prev.map(img => 
            img.id === uploadingImage.id 
              ? { ...img, progress: Math.min(img.progress + 10, 90) }
              : img
          )
        );
      }, 200);

      const response = await apiRequest('POST', '/api/upload/product-image', formData, {
        'Content-Type': 'multipart/form-data',
      });

      clearInterval(progressInterval);

      const result = await response.json();

      if (result.imageUrl) {
        // Update progress to 100%
        setUploadingImages(prev => 
          prev.map(img => 
            img.id === uploadingImage.id 
              ? { ...img, progress: 100 }
              : img
          )
        );

        // Add to images array
        onImagesChange([...images, result.imageUrl]);

        // Remove from uploading after a short delay
        setTimeout(() => {
          setUploadingImages(prev => prev.filter(img => img.id !== uploadingImage.id));
        }, 1000);

        toast({
          title: "Image uploaded",
          description: "Your image has been uploaded successfully.",
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      // Update uploading state with error
      setUploadingImages(prev => 
        prev.map(img => 
          img.id === uploadingImage.id 
            ? { ...img, error: 'Upload failed', progress: 0 }
            : img
        )
      );

      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeImage = useCallback(async (imageUrl: string, index: number) => {
    try {
      await apiRequest('DELETE', `/api/upload/product-image`, {
        imageUrl,
        productId,
      });

      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);

      toast({
        title: "Image removed",
        description: "Image has been removed successfully.",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete image. Please try again.",
        variant: "destructive",
      });
    }
  }, [images, onImagesChange, productId, toast]);

  const removeUploadingImage = useCallback((id: string) => {
    setUploadingImages(prev => prev.filter(img => img.id !== id));
  }, []);

  const canUploadMore = images.length + uploadingImages.length < maxImages && !disabled;

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      {canUploadMore && (
        <Card 
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            isDragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="p-8 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drag & drop images here, or click to select
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Support JPEG, PNG, WebP (max 5MB each)
            </p>
            <Badge variant="outline">
              {images.length + uploadingImages.length} / {maxImages} images
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Uploaded Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <Card className="overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={imageUrl}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                    }}
                  />
                  {index === 0 && (
                    <Badge className="absolute top-2 left-2 bg-blue-600">
                      Primary
                    </Badge>
                  )}
                  {!disabled && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(imageUrl, index);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Uploading Images */}
      {uploadingImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {uploadingImages.map((uploadingImage) => (
            <div key={uploadingImage.id} className="relative">
              <Card className="overflow-hidden">
                <div className="aspect-square relative bg-gray-100 flex items-center justify-center">
                  {uploadingImage.error ? (
                    <div className="text-center p-4">
                      <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <p className="text-xs text-red-600">{uploadingImage.error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => removeUploadingImage(uploadingImage.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                      <div className="absolute bottom-0 left-0 right-0 bg-blue-600 h-1">
                        <div 
                          className="bg-blue-400 h-full transition-all duration-300"
                          style={{ width: `${uploadingImage.progress}%` }}
                        />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {uploadingImage.progress}%
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Info text */}
      <p className="text-sm text-gray-500">
        The first image will be used as the primary product image in listings.
        You can upload up to {maxImages} images per product.
      </p>
    </div>
  );
}