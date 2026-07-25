import Image from 'next/image';

const PHOTOS = [
  {
    src: '/wallpapers/young-2003.webp',
    alt: 'Sahil as a baby in 2003',
    width: 206,
    height: 320,
    labelSrc: '/wallpapers/label-young-me.png',
    labelAlt: 'young me',
    labelWidth: 344,
    labelHeight: 124,
  },
  {
    src: '/wallpapers/adult-2026.webp',
    alt: 'Sahil in 2026',
    width: 640,
    height: 640,
    labelSrc: '/wallpapers/label-old-me.png',
    labelAlt: 'old me',
    labelWidth: 291,
    labelHeight: 94,
  },
] as const;

export function DesktopWallpaper() {
  return (
    <div className="desktop-photos">
      <div className="desktop-photos-stack">
        <div className="desktop-photos-row">
          {PHOTOS.map((photo) => (
            <div key={photo.src} className="desktop-photo-slot">
              <Image
                className="photo-frame-label"
                src={photo.labelSrc}
                alt={photo.labelAlt}
                width={photo.labelWidth}
                height={photo.labelHeight}
                priority
              />
              <figure className="photo-frame">
                <div className="photo-frame-titlebar" aria-hidden />
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
            </div>
          ))}
        </div>
        <Image
          className="desktop-photos-arrow"
          src="/wallpapers/photo-arrow.png"
          alt=""
          width={569}
          height={303}
          priority
          aria-hidden
        />
      </div>
    </div>
  );
}
