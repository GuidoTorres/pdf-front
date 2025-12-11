export const formatMs = (value?: number | null): string => {
  if (value === undefined || value === null) return "-";
  if (value < 1000) return `${value.toFixed(value < 10 ? 2 : 0)} ms`;
  return `${(value / 1000).toFixed( value < 10000 ? 2 : 1)} s`;
};

export const formatDateTime = (iso: string | undefined | null): string => {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};
