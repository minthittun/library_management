const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const buildSearchRegex = (value) => {
  if (!value) return null;
  return new RegExp(escapeRegExp(value), "i");
};
