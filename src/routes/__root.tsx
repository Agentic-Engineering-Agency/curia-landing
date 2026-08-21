import type { ReactNode } from "react";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import "../style.css";

const DESCRIPTION =
  "Curia reúne monitoreo judicial, plazos en Outlook cuando Microsoft 365 está conectado, Biblioteca documental con OCR y citas contrastadas con el SJF.";

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://agenticengineering.agency/#organization",
      name: "Agentic Engineering",
      url: "https://agenticengineering.agency/",
      email: "info@agenticengineering.agency",
      telephone: "+52-33-2241-2595",
    },
    {
      "@type": "Product",
      "@id": "https://agenticengineering.online/#curia",
      name: "Curia",
      url: "https://agenticengineering.online/",
      description:
        "Inteligencia legal para despachos mexicanos: monitoreo judicial, gestión de plazos, análisis documental e investigación jurídica con citas verificadas en un solo flujo.",
      category: "Software jurídico",
      brand: { "@type": "Brand", name: "Curia" },
      manufacturer: {
        "@id": "https://agenticengineering.agency/#organization",
      },
    },
  ],
};

const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%230d7377'/%3E%3Ctext x='16' y='22' font-family='Georgia,serif' font-style='italic' font-size='19' fill='white' text-anchor='middle'%3EC%3C/text%3E%3C/svg%3E";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { name: "description", content: DESCRIPTION },
      { name: "theme-color", content: "#0d7377" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Curia" },
      { property: "og:locale", content: "es_MX" },
      { property: "og:url", content: "https://agenticengineering.online/" },
      {
        property: "og:title",
        content: "Curia — Inteligencia legal para despachos mexicanos",
      },
      { property: "og:description", content: DESCRIPTION },
      { name: "twitter:card", content: "summary" },
      { title: "Curia — Inteligencia legal para despachos mexicanos" },
    ],
    links: [
      { rel: "canonical", href: "https://agenticengineering.online/" },
      { rel: "icon", href: FAVICON },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es-MX">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
          type="application/ld+json"
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
