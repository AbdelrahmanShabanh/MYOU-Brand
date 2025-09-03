import type { Metadata } from 'next/dist/lib/metadata/types/metadata-interface';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import Navbar from '@/components/Navbar';
import Cart from '@/components/Cart';
import Wishlist from '@/components/Wishlist';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MYOU Store',
  description: 'Your one-stop shop for modest fashion',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white dark:bg-gray-900 min-h-screen flex flex-col`}>
        <Providers>
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <Cart />
              <Wishlist />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
