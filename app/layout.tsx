import type { Metadata } from 'next';
import './globals.css';
import AppShell from '@/components/AppShell';
import { ThemeProvider } from '@/lib/theme-context';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'Apotek Kampus Sehat Farma',
  description: 'Sistem manajemen apotek modern, profesional, dan responsif.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
