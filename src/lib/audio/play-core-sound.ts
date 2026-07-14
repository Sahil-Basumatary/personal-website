import {
  FIXED_VOLUME,
  SOUND_ASSET_PATHS,
  resolvePlaybackMode,
  type CoreSoundName,
} from './audio-state';
import { playSynthesizedSound, type SynthAudioContext } from './synthesize';

type BrowserAudioContext = SynthAudioContext & {
  state: string;
  resume(): Promise<void>;
};

let sharedContext: BrowserAudioContext | null = null;
const assetCache = new Map<string, HTMLAudioElement>();

function getAudioContext(): BrowserAudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) return null;
  if (!sharedContext) {
    sharedContext = new Ctx() as unknown as BrowserAudioContext;
  }
  if (sharedContext.state === 'suspended') {
    void sharedContext.resume().catch(() => {});
  }
  return sharedContext;
}

function playAsset(src: string, volume: number): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      let audio = assetCache.get(src);
      if (!audio) {
        audio = new Audio(src);
        assetCache.set(src, audio);
      }
      audio.volume = Math.max(0, Math.min(1, volume));
      audio.currentTime = 0;
      audio
        .play()
        .then(() => resolve(true))
        .catch(() => resolve(false));
    } catch {
      resolve(false);
    }
  });
}

export async function playCoreSound(
  name: CoreSoundName,
  volume: number = FIXED_VOLUME
): Promise<'asset' | 'synth' | 'skipped'> {
  if (typeof window === 'undefined') return 'skipped';
  const assetPath = SOUND_ASSET_PATHS[name];
  if (resolvePlaybackMode(assetPath) === 'asset' && assetPath) {
    const played = await playAsset(assetPath, volume);
    if (played) return 'asset';
  }
  const ctx = getAudioContext();
  if (!ctx) return 'skipped';
  playSynthesizedSound(ctx, name, volume);
  return 'synth';
}

export function resetAudioRuntimeForTests(): void {
  sharedContext = null;
  assetCache.clear();
}
