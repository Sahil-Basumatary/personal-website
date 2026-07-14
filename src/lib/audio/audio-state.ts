export const AUDIO_STORAGE_KEY = 'sahilbzy:audio:v1';
export const DEFAULT_MUTED = true;
export const FIXED_VOLUME = 0.35;

export const CORE_SOUND_NAMES = [
  'click',
  'windowOpen',
  'windowClose',
  'alert',
] as const;

export type CoreSoundName = (typeof CORE_SOUND_NAMES)[number];

export interface AudioPrefs {
  version: 1;
  isMuted: boolean;
}

export const SOUND_ASSET_PATHS: Record<CoreSoundName, string | null> = {
  click: null,
  windowOpen: null,
  windowClose: null,
  alert: null,
};

export function isCoreSoundName(value: string): value is CoreSoundName {
  return (CORE_SOUND_NAMES as readonly string[]).includes(value);
}

export function shouldPlaySound(isMuted: boolean): boolean {
  return !isMuted;
}

export function nextMuted(isMuted: boolean): boolean {
  return !isMuted;
}

export function resolvePlaybackMode(
  assetPath: string | null
): 'asset' | 'synth' {
  return assetPath ? 'asset' : 'synth';
}

export function parseAudioPrefs(raw: string | null): AudioPrefs | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;
    const record = parsed as AudioPrefs;
    if (record.version !== 1 || typeof record.isMuted !== 'boolean') {
      return null;
    }
    return { version: 1, isMuted: record.isMuted };
  } catch {
    return null;
  }
}

export function serializeAudioPrefs(isMuted: boolean): string {
  const record: AudioPrefs = { version: 1, isMuted };
  return JSON.stringify(record);
}

export function readAudioMuted(storage: Pick<Storage, 'getItem'>): boolean {
  const prefs = parseAudioPrefs(storage.getItem(AUDIO_STORAGE_KEY));
  return prefs?.isMuted ?? DEFAULT_MUTED;
}

export function writeAudioMuted(
  storage: Pick<Storage, 'setItem'>,
  isMuted: boolean
): void {
  storage.setItem(AUDIO_STORAGE_KEY, serializeAudioPrefs(isMuted));
}
