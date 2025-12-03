import type { Metadata } from 'next';
import './globals.css';
import localFont from 'next/font/local';

const customFont = localFont({
  src: [
    {
      path: '../public/fonts/TikTokSans_SemiExpanded-Light.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-custom',
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
    <html lang="en" className={`${customFont.variable}`}>
      <head>
        <script
          src="https://static.line-scdn.net/liff/edge/2/sdk.js"
          async
        />
      </head>
      <body>{children}</body>
    </html>
  );
}