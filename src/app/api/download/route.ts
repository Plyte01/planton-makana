// src/app/api/download/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Helper function to convert a Web Stream to a Node.js stream
async function webStreamToNodeStream(webStream: ReadableStream<Uint8Array>) {
    const reader = webStream.getReader();
    const { PassThrough } = await import('stream');
    const nodeStream = new PassThrough();
    const pump = async () => {
        const { done, value } = await reader.read();
        if (done) {
            nodeStream.end();
            return;
        }
        nodeStream.write(value);
        pump();
    };
    pump();
    return nodeStream;
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(req.url);
        const resumeId = searchParams.get("id"); // Get ID from query param

        let resumeToDownload;

        if (resumeId) {
            // If an ID is provided, this is likely an admin request.
            // Ensure the user is logged in.
            if (!session) {
                return new NextResponse('Unauthorized: Must be logged in to download specific resumes.', { status: 401 });
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

        if (!resumeToDownload || !resumeToDownload.media || !resumeToDownload.media.originalFilename) {
            return new NextResponse('Resume not found or is missing file data.', { status: 404 });
        }

        // Fetch the file from Cloudinary as a stream
        const response = await fetch(resumeToDownload.fileUrl);

        if (!response.ok || !response.body) {
            throw new Error(`Cloudinary fetch failed: ${response.statusText}`);
        }

        // Convert the web stream to a Node.js stream for Vercel's runtime
        const body = await webStreamToNodeStream(response.body);
        
        const filename = resumeToDownload.media.originalFilename;
        
        const headers = new Headers();
        headers.set('Content-Disposition', `attachment; filename="${filename}"`);
        if (response.headers.has('Content-Type')) {
            headers.set('Content-Type', response.headers.get('Content-Type')!);
        }
        if (response.headers.has('Content-Length')) {
            headers.set('Content-Length', response.headers.get('Content-Length')!);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return new NextResponse(body as any, { status: 200, headers });

    } catch (error) {
        console.error('Download API Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}