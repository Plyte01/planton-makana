// src/app/api/download/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Readable } from 'stream'; // Import Readable from stream

// --- THIS IS THE DEFINITIVE FIX ---
// This line explicitly tells Vercel to run this route in the Node.js environment.
// This gives it access to the full Node.js API, including robust streaming.
export const runtime = 'nodejs';
// ------------------------------------

// Helper function to convert a Web Stream (from fetch) to a Node.js Readable stream
function webStreamToNodeReadable(webStream: ReadableStream<Uint8Array>): Readable {
    const reader = webStream.getReader();
    const nodeStream = new Readable({
        async read() {
            const { done, value } = await reader.read();
            if (done) {
                this.push(null); // Signal the end of the stream
                return;
            }
            this.push(value);
        }
    });
    return nodeStream;
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(req.url);
        const resumeId = searchParams.get("id");

        let resumeToDownload;

        if (resumeId) {
            if (!session) {
                return new NextResponse('Unauthorized', { status: 401 });
            }
            resumeToDownload = await db.resume.findUnique({
                where: { id: resumeId },
                include: { media: true },
            });
        } else {
            resumeToDownload = await db.resume.findFirst({
                where: { isDefault: true, isPublic: true, isDeleted: false },
                orderBy: { createdAt: 'desc' },
                include: { media: true },
            });
        }

        if (!resumeToDownload || !resumeToDownload.media || !resumeToDownload.media.originalFilename) {
            return new NextResponse('Resume not found.', { status: 404 });
        }

        const response = await fetch(resumeToDownload.fileUrl);

        if (!response.ok || !response.body) {
            throw new Error(`Cloudinary fetch failed: ${response.statusText}`);
        }

        // Use the Node.js stream directly
        const body = webStreamToNodeReadable(response.body);
        
        const filename = resumeToDownload.media.originalFilename;
        
        const headers = new Headers();
        headers.set('Content-Disposition', `attachment; filename="${filename}"`);
        if (response.headers.get('Content-Type')) {
            headers.set('Content-Type', response.headers.get('Content-Type')!);
        }
        if (response.headers.get('Content-Length')) {
            headers.set('Content-Length', response.headers.get('Content-Length')!);
        }

        // NextResponse can handle a Node.js Readable stream when in the Node.js runtime
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return new NextResponse(body as any, { status: 200, headers });

    } catch (error) {
        console.error('Download API Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
