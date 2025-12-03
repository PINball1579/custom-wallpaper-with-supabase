import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en">
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