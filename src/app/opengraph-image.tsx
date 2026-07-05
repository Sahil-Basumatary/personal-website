import { renderOgImage } from '@/lib/og/og-image';

export { alt, size, contentType } from '@/lib/og/og-image';

export default function OpengraphImage() {
  return renderOgImage();
}
