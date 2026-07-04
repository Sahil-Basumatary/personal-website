import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: "Sahil's Computer",
    short_name: "Sahil's PC",
    description: 'A Mac OS 9 inspired personal portfolio.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    // Splash matches the desktop; browser chrome matches the platinum menu bar.
    background_color: '#4a6889',
    theme_color: '#cccccc',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
