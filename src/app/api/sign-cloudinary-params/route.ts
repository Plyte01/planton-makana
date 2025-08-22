// src/app/api/sign-cloudinary-params/route.ts
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
    const body = await request.json();
    const { paramsToSign } = body;

    try {
        const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET as string);
        return NextResponse.json({ signature });
    } catch (error) {
        console.error('Error signing Cloudinary params:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}