export const normalizeSearchQuery = (value: string): string =>
  Array.from(value)
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join("")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 100);
