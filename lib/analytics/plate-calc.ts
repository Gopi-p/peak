/**
 * Plate calculator for a barbell loaded symmetrically.
 * Returns plates per side (descending), or null if exact target is impossible.
 */

const DEFAULT_PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25];

export function platesPerSide(
  totalKg: number,
  barKg = 20,
  available: number[] = DEFAULT_PLATES_KG,
): { plates: number[]; achievableKg: number } {
  if (totalKg < barKg) return { plates: [], achievableKg: barKg };
  let perSide = (totalKg - barKg) / 2;
  const plates: number[] = [];
  const sorted = [...available].sort((a, b) => b - a);
  for (const p of sorted) {
    while (perSide + 1e-6 >= p) {
      plates.push(p);
      perSide -= p;
    }
  }
  const achievableKg = barKg + 2 * plates.reduce((a, b) => a + b, 0);
  return { plates, achievableKg };
}
