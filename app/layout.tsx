import type { Metadata } from 'next';
import { TikTok_Sans } from 'next/font/google';
import './globals.css';

// Configure TikTok Sans font
const tiktokSans = TikTok_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-tiktok-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Dior Wallpaper Designer',
  description: 'Create your personalized Dior wallpaper',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={tiktokSans.variable}>
      <head>
        <script
          src="https://static.line-scdn.net/liff/edge/2/sdk.js"
          async
        />
      </head>
      <body className={tiktokSans.className}>{children}</body>
    </html>
  );
}