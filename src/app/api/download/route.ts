// src/app/api/download/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSignedDownloadUrl } from '@/lib/cloudinary'; // <-- IMPORT OUR NEW HELPER

export async function GET(_req: NextRequest) {
    try {
        // Step 1: Find the default resume and its associated media record.
        const defaultResume = await db.resume.findFirst({
            where: { isDefault: true, isPublic: true, isDeleted: false },
            orderBy: { createdAt: 'desc' },
            include: { 
                media: true,
            },
        });

        if (!defaultResume || !defaultResume.media || !defaultResume.media.originalFilename) {
            return new NextResponse('Downloadable resume not found or is missing data.', { status: 404 });
        }

        // Step 2: Get the required data from the database.
        const publicId = defaultResume.media.publicId;
        const filename = defaultResume.media.originalFilename;

        // Step 3: Use our helper to generate a temporary, signed URL from Cloudinary.
        // This URL contains a signature that proves the request is authorized.
        const signedUrl = getSignedDownloadUrl(publicId, filename);

        // Step 4: Redirect the user's browser to this temporary, secure URL.
        // The browser will then download the file directly from Cloudinary.
        return NextResponse.redirect(signedUrl);

    } catch (error) {
        console.error('Download API Error:', error);
        return new NextResponse('Internal Server Error. Please try again later.', { status: 500 });
    }
}
