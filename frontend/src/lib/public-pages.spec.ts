import { expect, it } from "vitest";
import { isPublicPage } from "./public-pages";
it("opens visitor pages while keeping administration gated", () => {
  for (const path of ["/map", "/locations", "/personnel", "/about"])
    expect(isPublicPage(path)).toBe(true);
  expect(isPublicPage("/admin")).toBe(false);
});
