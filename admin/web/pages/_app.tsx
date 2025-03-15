import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  // Log to verify the component is rendering
  useEffect(() => {
    console.log('App component mounted');
    // Check if Tailwind classes exist in the document
    const hasTailwind = document.documentElement.classList.contains('dark') !== undefined;
    console.log('Tailwind CSS detected:', hasTailwind);
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp; 