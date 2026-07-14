import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             'Dr. Dhruba Prasad Bhattarai',
    short_name:       'DPB Research',
    description:      'Research & publications portal of Prof. Dhruba Prasad Bhattarai — folk literature and cultural studies.',
    start_url:        '/',
    display:          'standalone',
    background_color: '#F5F4F1',
    theme_color:      '#5c2a00',
    icons: [
      { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      { src: '/icon.svg',    sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  };
}
