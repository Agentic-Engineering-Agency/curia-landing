import { createRouter } from "@tanstack/react-router";
import type { Router } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export type AppRouter = Router<typeof routeTree>;

export function getRouter(): AppRouter {
  return createRouter({
    routeTree,
    scrollRestoration: false,
    defaultPreload: "intent",
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: AppRouter;
  }
}
