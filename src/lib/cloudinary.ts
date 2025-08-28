// src/lib/cloudinary.ts
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import streamifier from 'streamifier';
import { slugify } from './utils';

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
    // 1. Sanitize the filename to be URL-safe.
    // This is important to prevent issues with special characters in filenames.
    const cleanFilename = slugify(filename);

    // 2. Use the cloudinary.utils.url() method, which is designed for this.
    const signedUrl = cloudinary.utils.url(publicId, {
        // --- Core Options ---
        resource_type: 'raw', // Specify that it's a raw file
        sign_url: true,       // CRUCIAL: Tell the SDK to sign the URL
        secure: true,         // Use HTTPS

        // --- Download Transformation ---
        // This is the key. We apply transformations directly.
        transformation: [
            {
                // This flag forces the browser to treat the URL as a download attachment.
                // We append the sanitized filename to it.
                flags: `attachment:${cleanFilename}`
            }
        ]
    });

    return signedUrl;
};
// -----------------------------------------------------------
export default cloudinary;
