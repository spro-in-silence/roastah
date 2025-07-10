import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const storage = new Storage();

export class UploadService {
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.MEDIA_BUCKET || 'roastah-media-bucket';
  }

  async uploadProductImage(file: Buffer, originalName: string, productId: number): Promise<string> {
    try {
      // Generate unique filename with organized structure
      const fileExtension = path.extname(originalName).toLowerCase();
      const fileName = `products/${productId}/${uuidv4()}${fileExtension}`;
      
      // Get bucket reference
      const bucket = storage.bucket(this.bucketName);
      const fileObject = bucket.file(fileName);

      // Upload with metadata
      await fileObject.save(file, {
        metadata: {
          contentType: this.getContentType(fileExtension),
          metadata: {
            productId: productId.toString(),
            uploadedAt: new Date().toISOString(),
            originalName: originalName
          }
        },
        public: true, // Make images publicly accessible
      });

      // Return public URL
      return `https://storage.googleapis.com/${this.bucketName}/${fileName}`;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  }

  async deleteProductImage(imageUrl: string): Promise<void> {
    try {
      // Extract file name from URL
      const fileName = this.getFileNameFromUrl(imageUrl);
      if (!fileName) {
        throw new Error('Invalid image URL');
      }

      const bucket = storage.bucket(this.bucketName);
      const fileObject = bucket.file(fileName);

      await fileObject.delete();
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error('Failed to delete image');
    }
  }

  async deleteAllProductImages(productId: number): Promise<void> {
    try {
      const bucket = storage.bucket(this.bucketName);
      const [files] = await bucket.getFiles({
        prefix: `products/${productId}/`
      });

      const deletePromises = files.map(file => file.delete());
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting product images:', error);
      throw new Error('Failed to delete product images');
    }
  }

  private getContentType(fileExtension: string): string {
    switch (fileExtension) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.webp':
        return 'image/webp';
      case '.gif':
        return 'image/gif';
      default:
        return 'image/jpeg';
    }
  }

  private getFileNameFromUrl(url: string): string | null {
    try {
      const urlParts = url.split('/');
      const bucketIndex = urlParts.findIndex(part => part === this.bucketName);
      if (bucketIndex === -1) return null;
      
      return urlParts.slice(bucketIndex + 1).join('/');
    } catch {
      return null;
    }
  }

  validateImageFile(file: Express.Multer.File): boolean {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
    }

    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 5MB.');
    }

    return true;
  }
}

export const uploadService = new UploadService();