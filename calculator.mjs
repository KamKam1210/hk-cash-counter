export const denominations = {
  notes: [500, 100, 50, 20, 10],
  coins: [10, 5, 2, 1, 0.5, 0.2, 0.1],
};

export const toCents = (amount) => Math.round(amount * 100);

export function sanitizeCount(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return 0;
  return Math.min(Number.parseInt(digits, 10), 99999);
}

export function calculateLineCents(amount, count) {
  return toCents(amount) * sanitizeCount(count);
}

export function calculateTotals(counts = {}) {
  const sumGroup = (group) => denominations[group].reduce(
    (total, amount) => total + calculateLineCents(amount, counts[`${group}-${amount}`]),
    0,
  );
  const notes = sumGroup("notes");
  const coins = sumGroup("coins");
  return { notes, coins, grand: notes + coins };
}

export function formatHKD(cents) {
  return new Intl.NumberFormat("zh-HK", {
    style: "currency",
    currency: "HKD",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
  }).format(cents / 100).replace("$", "HK$");
}
