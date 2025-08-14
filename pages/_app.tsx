import type { AppProps } from 'next/app';
import Head from 'next/head';
import '@/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Udyam Registration Clone</title>
        <meta name="description" content="Udyam Registration Form Clone - Complete your registration in 2 simple steps" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://udyam-clone.vercel.app/" />
        <meta property="og:title" content="Udyam Registration Clone" />
        <meta property="og:description" content="Complete your Udyam registration in 2 simple steps" />
        <meta property="og:image" content="/og-image.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://udyam-clone.vercel.app/" />
        <meta property="twitter:title" content="Udyam Registration Clone" />
        <meta property="twitter:description" content="Complete your Udyam registration in 2 simple steps" />
        <meta property="twitter:image" content="/og-image.png" />

        {/* Preload fonts */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          as="style"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}