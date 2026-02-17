export function slugify(input: string) {
  if (!input) return '';
  const map: Record<string, string> = {
    ş: 's', Ş: 's', ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ü: 'u', Ü: 'u', ö: 'o', Ö: 'o', ı: 'i', İ: 'i'
  };

  const replaced = input
    .split('')
    .map((c) => map[c] || c)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  return replaced;
}
