import Image from 'next/image';

const PHOTOS = [
  {
    src: '/wallpapers/young-2003.webp',
    year: '2003',
    alt: 'Sahil as a baby in 2003',
    width: 206,
    height: 320,
  },
  {
    src: '/wallpapers/adult-2026.webp',
    year: '2026',
    alt: 'Sahil in 2026',
    width: 640,
    height: 640,
  },
] as const;

export function DesktopWallpaper() {
  return (
    <div className="desktop-photos">
      {PHOTOS.map((photo) => (
        <figure key={photo.year} className="photo-frame">
          <div className="photo-frame-titlebar">
            <span className="photo-frame-title">{photo.year}</span>
          </div>
          <div className="photo-frame-body">
            <Image
              className="photo-frame-img"
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              priority
              sizes="(max-width: 768px) 45vw, 260px"
            />
          </div>
        </figure>
      ))}
    </div>
  );
}
