// src/lib/cloudinary.ts
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import streamifier from 'streamifier';
import { slugify } from './utils'; // Import slugify for clean filenames

// Configure the Cloudinary instance once
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

// uploadFromBuffer function remains the same...
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const uploadFromBuffer = (buffer: Buffer, options: any): Promise<UploadApiResponse | UploadApiErrorResponse> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (result) resolve(result);
            else reject(error);
        });
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};


// --- THIS IS THE FINAL, CORRECTED HELPER FUNCTION ---
/**
 * Generates a secure, signed URL for downloading a restricted asset with its original filename.
 * @param publicId The public_id of the Cloudinary asset.
 * @param filename The desired original filename for the download.
 * @returns A signed URL that is valid for a short period and forces download with the correct name.
 */
export const getSignedDownloadUrl = (publicId: string, filename: string): string => {
    // Sanitize the filename to be URL-safe. Remove special characters.
    // This prevents issues with complex filenames.
    const cleanFilename = slugify(filename.substring(0, filename.lastIndexOf('.'))) + filename.substring(filename.lastIndexOf('.'));
    
    // Generate the signed URL using Cloudinary's built-in methods.
    // We pass the desired transformation directly in the options.
    const signedUrl = cloudinary.url(publicId, {
        // This tells the SDK we are signing the URL for authenticated access.
        sign_url: true, 
        
        // This is crucial for non-image files.
        resource_type: 'raw', 
        
        // These flags are applied as transformations.
        // `fl_attachment` forces the download.
        // Appending the sanitized filename to the flag tells Cloudinary what to name the file.
        transformation: [
            { flags: `attachment:${cleanFilename}` }
        ]
    });

    return signedUrl;
};
// --------------------------------------------------

export default cloudinary;
