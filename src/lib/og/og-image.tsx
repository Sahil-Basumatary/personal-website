import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { SITE } from '@/lib/site';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = `${SITE.name} — a Mac OS 9 desktop portfolio by ${SITE.author}`;

// Satori cannot parse woff2, so the OG card uses the raw Chicago TTF. Copy is
// kept within its glyph coverage (no em dash) to avoid missing-character boxes.
const chicago = readFileSync(
  join(process.cwd(), 'public/fonts/ChicagoFLF.ttf')
);
const iconSrc = `data:image/png;base64,${readFileSync(
  join(process.cwd(), 'public/icons/icon-512.png')
).toString('base64')}`;

const PLATINUM = '#cccccc';
const DESKTOP = '#4a6889';

const pinstripe =
  'repeating-linear-gradient(0deg, #bcbcbc 0, #bcbcbc 1px, #e8e8e8 1px, #e8e8e8 2px)';

export function renderOgImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: DESKTOP,
        fontFamily: 'Chicago',
        color: '#000',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: 52,
          paddingLeft: 24,
          paddingRight: 24,
          backgroundColor: '#dddddd',
          borderBottom: '2px solid #000',
          fontSize: 24,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={iconSrc} width={30} height={30} alt="" />
        <span style={{ marginLeft: 12, fontWeight: 700 }}>{SITE.name}</span>
        <span style={{ marginLeft: 40, color: '#333' }}>
          File Edit View Special
        </span>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 56,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: 1000,
            backgroundColor: PLATINUM,
            border: '2px solid #000',
            boxShadow: '8px 8px 0 rgba(0,0,0,0.35)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 46,
              borderBottom: '2px solid #000',
              backgroundImage: pinstripe,
            }}
          >
            <div
              style={{
                backgroundColor: PLATINUM,
                padding: '2px 18px',
                fontSize: 22,
              }}
            >
              About This Computer
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: 56,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={iconSrc}
              width={188}
              height={188}
              alt=""
              style={{ border: '2px solid #000' }}
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginLeft: 48,
              }}
            >
              <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05 }}>
                {SITE.name}
              </div>
              <div style={{ fontSize: 34, marginTop: 20, color: '#222' }}>
                A Mac OS 9 desktop portfolio
              </div>
              <div style={{ fontSize: 28, marginTop: 12, color: '#444' }}>
                {`by ${SITE.author}`}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '0 40px 32px',
        }}
      >
        <div
          style={{
            backgroundColor: '#dddddd',
            border: '2px solid #000',
            padding: '6px 18px',
            fontSize: 24,
          }}
        >
          sahilbzy.com
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [{ name: 'Chicago', data: chicago, style: 'normal', weight: 400 }],
    }
  );
}
