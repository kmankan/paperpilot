import { writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function POST(request: NextRequest) {

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name.replace(/\s+/g, '-').toLowerCase();
    const publicPath = path.join(process.cwd(), 'public/pdfs');
    
    await writeFile(`${publicPath}/${filename}`, buffer);

    
    return NextResponse.json({ 
      success: true,
      filename: `/pdfs/${filename}`
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
}