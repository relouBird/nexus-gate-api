// Headers que undici/HTTP gèrent eux-mêmes — ne jamais les faire suivre tels quels
const HOP_BY_HOP = new Set([
  'host',
  'connection',
  'content-length',
  'transfer-encoding',
  'keep-alive',
  'upgrade',
]);

export const setHeaderOnMap = (
  toFiltersHeaders: Record<string, string | string[] | undefined>,
) => {
  const headers: Record<string, string> = {};

  for (const [key, value] of Object.entries(toFiltersHeaders)) {
    if (typeof value === 'string' && !HOP_BY_HOP.has(key.toLowerCase()))
      headers[key] = value;
  }

  return headers;
};