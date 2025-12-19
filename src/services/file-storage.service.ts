/**
 * File Storage Service
 * 
 * Handles file uploads and storage.
 * Supports local storage and can be extended for S3, Cloudinary, etc.
 */

import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface UploadedFile {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  path: string;
}

export interface UploadOptions {
  maxSizeBytes?: number;
  allowedTypes?: string[];
  directory?: string;
}

const DEFAULT_OPTIONS: UploadOptions = {
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ],
  directory: 'uploads',
};

export class FileStorageService {
  private static baseDir = path.join(process.cwd(), 'public');

  static async upload(
    file: File,
    options: UploadOptions = {}
  ): Promise<UploadedFile | null> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    try {
      // Validate file size
      if (opts.maxSizeBytes && file.size > opts.maxSizeBytes) {
        throw new Error(`File size exceeds maximum allowed (${opts.maxSizeBytes / 1024 / 1024}MB)`);
      }

      // Validate file type
      if (opts.allowedTypes && !opts.allowedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} is not allowed`);
      }

      // Generate unique filename
      const ext = path.extname(file.name);
      const id = uuidv4();
      const fileName = `${id}${ext}`;
      
      // Create directory structure: /public/uploads/YYYY/MM/
      const now = new Date();
      const year = now.getFullYear().toString();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const relativePath = path.join(opts.directory!, year, month);
      const fullDir = path.join(this.baseDir, relativePath);

      // Ensure directory exists
      if (!existsSync(fullDir)) {
        await mkdir(fullDir, { recursive: true });
      }

      // Write file
      const filePath = path.join(fullDir, fileName);
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      // Generate public URL
      const url = `/${relativePath.replace(/\\/g, '/')}/${fileName}`;

      return {
        id,
        name: fileName,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url,
        path: filePath,
      };
    } catch (error) {
      console.error('File upload error:', error);
      return null;
    }
  }

  static async delete(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.baseDir, filePath);
      if (existsSync(fullPath)) {
        await unlink(fullPath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('File delete error:', error);
      return false;
    }
  }

  static getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'solar:gallery-linear';
    if (mimeType === 'application/pdf') return 'solar:document-text-linear';
    if (mimeType.includes('word')) return 'solar:document-linear';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'solar:chart-2-linear';
    if (mimeType.startsWith('text/')) return 'solar:file-text-linear';
    return 'solar:file-linear';
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default FileStorageService;
