import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import classNames from 'classnames';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Coding Explorations',
  description:
    "Trying out cool computer graphics stuff inspired by Sebastian Lague's Coding Adventures series",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-white">
      <body className={classNames(inter.className, 'h-full')}>{children}</body>
    </html>
  );
}
