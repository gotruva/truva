import { ImageResponse } from 'next/og';
import { getBlogPost, getBlogPosts } from '@/lib/blog';

export const alt = 'Truva blog';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  const title = post?.title ?? 'Truva';
  const eyebrow = post ? `Truva · ${post.categoryLabel}` : 'Truva';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0052FF 0%, #0039B3 100%)',
          color: '#ffffff',
          padding: 72,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 30, fontWeight: 600, opacity: 0.85, letterSpacing: 1 }}>
          {eyebrow}
        </div>
        <div style={{ display: 'flex', fontSize: 68, fontWeight: 800, lineHeight: 1.08, maxWidth: 1000 }}>
          {title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', fontSize: 32, fontWeight: 700 }}>gotruva.com</div>
          <div style={{ display: 'flex', fontSize: 26, opacity: 0.8 }}>
            Compare. Decide. Save.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
