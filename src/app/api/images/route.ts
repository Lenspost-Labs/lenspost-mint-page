import { CDN_IMAGE_URL, R2_IMAGE_URL } from '@/data/constants';
import { getCollectionData } from '@/services';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.redirect(
      'https://mint.poster.fun/OG_logo_1200x630.png'
    );
  }

  try {
    const data = await getCollectionData(slug);
    return NextResponse.redirect(
      data.imageUrl.replace(R2_IMAGE_URL, CDN_IMAGE_URL)
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch collection data' },
      { status: 500 }
    );
  }
}
