// src/lib/cloudinary.ts
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import streamifier from 'streamifier';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const uploadFromBuffer = (buffer: Buffer, options: any): Promise<UploadApiResponse | UploadApiErrorResponse> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (result) {
                resolve(result);
            } else {
                reject(error);
            }
        });
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

export const getSignedDownloadUrl = (publicId: string, filename: string): string => {
    // This tells Cloudinary to force a download with a specific filename.
    const attachmentFlag = `fl_attachment:${filename}`;

    const signedUrl = cloudinary.utils.private_download_url(publicId, '', {
        resource_type: 'raw', // Important for non-image files
        type: 'upload',
        // The URL will be valid for 1 hour
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        // Apply the download flag as a transformation
        attachment: true,
    });

    // Manually inject the filename transformation for a cleaner download name
    // This is a more robust way than relying on the `attachment` parameter alone for naming.
    const urlParts = signedUrl.split('/upload/');
    if (urlParts.length === 2) {
        return `${urlParts[0]}/upload/${attachmentFlag}/${urlParts[1]}`;
    }

    return signedUrl; // Fallback

};

export default cloudinary;
