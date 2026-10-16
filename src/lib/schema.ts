import { BUSINESS, SERVICES, SITE_URL } from "./site";

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#business`,
    name: BUSINESS.legalName,
    alternateName: BUSINESS.name,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    image: `${SITE_URL}/og.jpg`,
    email: BUSINESS.email,
    ...(BUSINESS.phone ? { telephone: `+1-${BUSINESS.phone.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")}` } : {}),
    description:
      "Commercial and post-construction cleaning for general contractors, property managers, schools, warehouses, churches and government buildings.",
    areaServed: [
      { "@type": "City", name: "Nashville", containedInPlace: { "@type": "State", name: "Tennessee" } },
      { "@type": "AdministrativeArea", name: "Middle Tennessee" },
      { "@type": "AdministrativeArea", name: "Central Pennsylvania" },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Cleaning services",
      itemListElement: SERVICES.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.name, url: `${SITE_URL}/services#${s.slug}` },
      })),
    },
  };
}
