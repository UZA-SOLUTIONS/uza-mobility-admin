export function toSearchParams(
  filters: Record<string, string | number | boolean | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === '') {
      continue;
    }
    params.set(key, String(value));
  }

  return params;
}
