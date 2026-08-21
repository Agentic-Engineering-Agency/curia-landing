// Wrangler infiere variables públicas desde wrangler.jsonc, pero no nombres de
// secretos (viven fuera del repositorio). Se augmenta sólo ese contrato y se
// declara el módulo server-only sin importar todos los tipos runtime de Worker
// al cliente, que colisionarían con Element del DOM.
declare namespace Cloudflare {
  interface Env {
    CONTACT_SOURCE: string;
    TWENTY_API_KEY?: string;
    TWENTY_BASE_URL?: string;
  }
}

declare module "cloudflare:workers" {
  export const env: Cloudflare.Env;
}
