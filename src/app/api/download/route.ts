// src/app/api/download/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Fix the ESLint warning by prefixing the unused variable with an underscore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
    try {
        const defaultResume = await db.resume.findFirst({
            where: { isDefault: true, isPublic: true, isDeleted: false },
            orderBy: { createdAt: 'desc' },
            include: { 
                media: true, // This is crucial to get the related media object
            },
        });

        // Now, we can safely access media.originalFilename
        if (!defaultResume || !defaultResume.media || !defaultResume.media.originalFilename) {
            return new NextResponse('Downloadable resume not found or filename is missing.', { status: 404 });
        }

        const fileUrl = defaultResume.fileUrl;
        const response = await fetch(fileUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch file from Cloudinary. Status: ${response.status}`);
        }

        const fileBlob = await response.blob();
        
        // Use the filename stored in the database
        const filename = defaultResume.media.originalFilename;
        
        const headers = new Headers();
        headers.set('Content-Disposition', `attachment; filename="${filename}"`);
        headers.set('Content-Type', fileBlob.type);

        return new NextResponse(fileBlob, { status: 200, statusText: 'OK', headers });

    } catch (error) {
        console.error('Download API Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}