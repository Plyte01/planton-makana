// src/app/api/download/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
    try {
        // Step 1: Find the default resume record.
        const defaultResume = await db.resume.findFirst({
            where: { isDefault: true, isPublic: true, isDeleted: false },
            orderBy: { createdAt: 'desc' },
        });

        if (!defaultResume || !defaultResume.mediaId) {
            return new NextResponse('Default resume or its media link not found.', { status: 404 });
        }

        // --- THIS IS THE NEW, MORE ROBUST LOGIC ---
        // Step 2: Use the `mediaId` from the resume to fetch the media record directly.
        const mediaRecord = await db.media.findUnique({
            where: { id: defaultResume.mediaId },
        });
        
        if (!mediaRecord || !mediaRecord.originalFilename) {
            return new NextResponse('Associated media file not found or filename is missing.', { status: 404 });
        }
        // ------------------------------------------

        // Step 3: Fetch the file from the secure Cloudinary URL.
        const fileUrl = mediaRecord.url;
        const response = await fetch(fileUrl);

        if (!response.ok) {
            // Log the actual error from Cloudinary for better debugging
            console.error(`Cloudinary fetch failed with status: ${response.status}`);
            throw new Error('Failed to fetch file from Cloudinary');
        }

        const fileBlob = await response.blob();
        
        // Step 4: Use the filename from the fetched media record.
        const filename = mediaRecord.originalFilename;
        
        const headers = new Headers();
        headers.set('Content-Disposition', `attachment; filename="${filename}"`);
        headers.set('Content-Type', fileBlob.type);

        return new NextResponse(fileBlob, { status: 200, statusText: 'OK', headers });

    } catch (error) {
        console.error('Download API Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}