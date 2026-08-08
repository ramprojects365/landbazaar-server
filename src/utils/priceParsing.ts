const INDIAN_PRICE_MULTIPLIERS: Record<string, number> = {
  lakh: 100_000,
  lakhs: 100_000,
  crore: 10_000_000,
  crores: 10_000_000,
  thousand: 1_000,
  thousands: 1_000,
  hundred: 100,
  hundreds: 100,
};

export const parseIndianPriceValue = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const compact = trimmed
    .replace(/₹/g, '')
    .replace(/,/g, '')
    .replace(/inr/gi, '')
    .trim();

  if (!compact) {
    return undefined;
  }

  const normalized = compact.replace(/\s+/g, ' ');
  const match = normalized.match(/^([0-9]+(?:\.[0-9]+)?)\s*(lakh|lakhs|crore|crores|thousand|thousands|hundred|hundreds)?$/i);

  if (match) {
    const amount = parseFloat(match[1]);
    const unit = match[2]?.toLowerCase();

    if (!Number.isFinite(amount)) {
      return undefined;
    }

    if (!unit) {
      return amount;
    }

    const multiplier = INDIAN_PRICE_MULTIPLIERS[unit];
    return multiplier ? amount * multiplier : amount;
  }

  const plainNumber = parseFloat(normalized.replace(/[^0-9.]/g, ''));
  return Number.isFinite(plainNumber) && plainNumber > 0 ? plainNumber : undefined;
};
