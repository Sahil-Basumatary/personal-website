import { revalidatePath } from 'next/cache';

export function revalidatePortfolio() {
  revalidatePath('/');
}
