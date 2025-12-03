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
    {
      path: '../public/fonts/TikTokSans_SemiExpanded-Regular.ttf',
      weight: '500',
      style: 'medium',
    },
    {
      path: '../public/fonts/TikTokSans_SemiExpanded-SemiBold.ttf',
      weight: '700',
      style: 'bold',
    },
  ],
  variable: '--font-custom',
  display: 'swap',
});

const headingFont = localFont({
  src: '../public/fonts/TikTokSans_SemiExpanded-SemiBold.ttf',
  variable: '--font-heading',
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
    <html lang="en" className={`${customFont.variable} ${headingFont.variable}`}>
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