// src/app/api/download/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(req.url);
        const resumeId = searchParams.get("id"); // Get optional ID from query param

        let resumeToDownload;

        if (resumeId) {
            // If an ID is provided, this is an admin request.
            // Ensure the user is logged in.
            if (!session) {
                return new NextResponse('Unauthorized: Must be logged in to download specific versions.', { status: 401 });
            }
            // Fetch the specific resume by its ID
            resumeToDownload = await db.resume.findUnique({
                where: { id: resumeId },
                include: { media: true },
            });
        } else {
            // If NO ID is provided, this is a public request for the default resume.
            // This does not require a session.
            resumeToDownload = await db.resume.findFirst({
                where: { isDefault: true, isPublic: true, isDeleted: false },
                orderBy: { createdAt: 'desc' },
                include: { media: true },
            });
        }

        // Check if a valid resume and its associated media file were found
        if (!resumeToDownload || !resumeToDownload.media || !resumeToDownload.media.originalFilename) {
            return new NextResponse('Resume not found or is missing required file data.', { status: 404 });
        }

        // Fetch the file from Cloudinary. We only await the headers, not the full body.
        const response = await fetch(resumeToDownload.fileUrl);

        if (!response.ok || !response.body) {
            throw new Error(`Cloudinary responded with status: ${response.status}`);
        }

        // Create the headers for the response that will be sent to the user's browser.
        const headers = new Headers();
        
        // This is the crucial header that instructs the browser to download the file
        // and provides the original, correct filename.
        headers.set('Content-Disposition', `attachment; filename="${resumeToDownload.media.originalFilename}"`);
        
        // Pass through the original Content-Type (e.g., 'application/pdf') from Cloudinary.
        if (response.headers.has('Content-Type')) {
            headers.set('Content-Type', response.headers.get('Content-Type')!);
        }

        // Pass through the original Content-Length so the browser can show a download progress bar.
        if (response.headers.has('Content-Length')) {
            headers.set('Content-Length', response.headers.get('Content-Length')!);
        }

        // Return a new NextResponse, passing the file stream from Cloudinary directly to the user.
        // This is highly efficient and avoids memory/timeout issues.
        return new NextResponse(response.body, { status: 200, headers });

    } catch (error) {
        console.error('Download API Error:', error);
        return new NextResponse('Internal Server Error. Please try again later.', { status: 500 });
    }
}
