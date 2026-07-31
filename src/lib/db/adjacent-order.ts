export type OrderRow = {
  id: string;
  order: number;
};

export function pickAdjacentSwap(
  ordered: OrderRow[],
  id: string,
  direction: 'up' | 'down'
): { current: OrderRow; target: OrderRow } | null {
  const currentIndex = ordered.findIndex((row) => row.id === id);
  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  const current = ordered[currentIndex];
  const target = ordered[targetIndex];

  if (!current || !target) {
    return null;
  }

  return { current, target };
}
