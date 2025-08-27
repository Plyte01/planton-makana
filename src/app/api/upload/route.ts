// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { uploadFromBuffer } from '@/lib/cloudinary';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import path from 'path'; // Import the path module

// Disable the default body parser to handle FormData
export const config = {
    api: {
        bodyParser: false,
    },
};

export async function POST(req: NextRequest) {
    // 1. Authenticate the request
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Get the file from the request
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
        return new NextResponse('No file provided', { status: 400 });
    }

    // 3. Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    try {
        // 4. Determine resource_type based on file type
        let resource_type: 'image' | 'raw' = 'image';
        if (file.type.includes('pdf') || file.type.includes('document')) {
            resource_type = 'raw';
        }

        const fileExtension = path.extname(file.name).substring(1);

        // --- NEW UPLOAD LOGIC ---
        // This tells Cloudinary to keep the original filename for delivery,
        // but to use a unique, randomly generated public_id for storage.
        const uploadOptions = {
            resource_type,
            format: fileExtension,
        };
        // ------------------------

        // 5. Upload to Cloudinary with original filename preserved
        const result = await uploadFromBuffer(buffer, uploadOptions);

        return NextResponse.json({
            secure_url: result.secure_url,
            public_id: result.public_id,
            original_filename: file.name,
        });
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        return new NextResponse('Upload failed', { status: 500 });
    }
}