import type { Metadata } from 'next';
import './globals.css';
import './colors-test.css';
import { Toaster } from '@/components/ui/toaster';
import { DatabaseStatus } from '@/components/database-status';

export const metadata: Metadata = {
  title: 'Lucy Tejada',
  description: 'Plataforma moderna de gestión de cursos.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log('[LAYOUT] Renderizando RootLayout - globals.css debe estar cargado');
  
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              console.log('[HEAD] CSS variables disponibles:');
              const root = document.documentElement;
              const styles = getComputedStyle(root);
              console.log('--background:', styles.getPropertyValue('--background'));
              console.log('--foreground:', styles.getPropertyValue('--foreground'));
              console.log('--primary:', styles.getPropertyValue('--primary'));
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              console.log('[BODY] Body cargado - Tailwind debería estar activo');
              console.log('[BODY] Clases del body:', document.body.className);
              const computed = window.getComputedStyle(document.body);
              console.log('[BODY] Background-color computado:', computed.backgroundColor);
              console.log('[BODY] Color computado:', computed.color);
            `,
          }}
        />
        {children}
        <DatabaseStatus />
        <Toaster />
      </body>
    </html>
  );
}
