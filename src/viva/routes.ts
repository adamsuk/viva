// Hash routes. Three views, plus anchors for sections inside the guide.

export type View = "home" | "walk" | "guide";
export type Anchor = "parts" | "evidence" | "prior-art" | "audit" | null;

export interface Route {
  view: View;
  anchor: Anchor;
}

export function routeFromHash(hash: string): Route {
  const key = hash.replace(/^#\/?/, "").toLowerCase();
  switch (key) {
    case "walk":
      return { view: "walk", anchor: null };
    case "guide":
      return { view: "guide", anchor: null };
    case "parts":
      return { view: "home", anchor: "parts" };
    case "evidence":
    case "prior-art":
    case "audit":
      return { view: "guide", anchor: key };
    default:
      return { view: "home", anchor: null };
  }
}

export function hashFor(route: Route): string {
  if (route.anchor) return `#${route.anchor}`;
  return route.view === "home" ? "" : `#${route.view}`;
}
