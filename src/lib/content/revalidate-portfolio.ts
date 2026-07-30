import { revalidatePath, updateTag } from 'next/cache';

export const PORTFOLIO_CACHE_TAG = 'portfolio';

export function revalidatePortfolio() {
  updateTag(PORTFOLIO_CACHE_TAG);
  revalidatePath('/');
}
