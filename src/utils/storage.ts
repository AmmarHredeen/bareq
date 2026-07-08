/**
 * تنسيق سعة التخزين: يحوّل 1024+ غيغابايت إلى تيرابايت.
 * مثال: 1024 → "1TB" ، 256 → "256"
 */
export function formatStorageSize(gb: number): string {
  if (gb >= 1024 && gb % 1024 === 0) {
    return `${gb / 1024}TB`;
  }
  return `${gb}`;
}

/** توليد label من الرام والتخزين. مثال: (8, 256) → "8/256" */
export function buildStorageLabel(ramGb: number, storageGb: number): string {
  return `${ramGb}/${formatStorageSize(storageGb)}`;
}
