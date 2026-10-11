export function isPublicPage(pathname: string): boolean {
  return [
    "/map",
    "/locations",
    "/personnel",
    "/about",
    "/signin-again",
  ].includes(pathname);
}
