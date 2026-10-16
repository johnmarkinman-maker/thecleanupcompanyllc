export const SITE_URL = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://thecleanupcompanyllc.com").replace(/\/$/, "");

export const BUSINESS = {
  name: "The Cleanup Company",
  legalName: "The Cleanup Company LLC",
  email: "ketchtravis@thecleanupcompanyllc.com",
  // Confirmed by the owner. Set NEXT_PUBLIC_PHONE="" to hide every call button.
  phone: process.env.NEXT_PUBLIC_PHONE ?? "(360) 853-6789",
  markets: ["Greater Nashville / Middle Tennessee", "Central Pennsylvania"],
};

export const phoneHref = BUSINESS.phone ? `tel:+1${BUSINESS.phone.replace(/\D/g, "")}` : "";

export type Service = {
  slug: string;
  name: string;
  short: string;
  image: string;
  alt: string;
  intro: string;
  items: string[];
};

export const SERVICES: Service[] = [
  {
    slug: "construction-cleanup",
    name: "Construction Cleanup",
    short: "Rough, final and touch-up cleans, phased to your schedule.",
    image: "/images/construction-cleanup.webp",
    alt: "Technician in a dark green polo wiping an interior glass wall in a finished commercial space with polished concrete floors",
    intro:
      "Post-construction cleaning built around your schedule, not ours. We phase the work so each trade hands off a clean space and the building is ready the day you walk it.",
    items: [
      "Rough clean after framing, drywall and MEP",
      "Final clean before punch walk and owner walkthrough",
      "Touch-up clean right before turnover",
      "Multi-phase cleaning for occupied or staged projects",
      "Fine dust removal from ledges, vents, fixtures and glass",
    ],
  },
  {
    slug: "commercial-cleaning",
    name: "Commercial Cleaning",
    short: "Recurring cleaning for offices, retail and managed properties.",
    image: "/images/commercial.webp",
    alt: "Open office floor at dusk with polished concrete aisle and a janitorial cart staged by a glass door",
    intro:
      "Recurring cleaning for buildings that need to look right every morning. Scopes are written around how your space is actually used.",
    items: [
      "Offices and corporate suites",
      "Retail and storefronts",
      "Churches and nonprofit facilities",
      "Government buildings",
      "Property-managed and multi-tenant buildings",
    ],
  },
  {
    slug: "schools",
    name: "Schools & Educational Facilities",
    short: "Classrooms, hallways and summer turnarounds before the bell.",
    image: "/images/schools.webp",
    alt: "Technician in a green polo running a walk-behind floor scrubber down a bright school hallway lined with blue lockers",
    intro:
      "Schools run on calendars that do not move. We plan around breaks, summer projects and new construction so rooms are ready for the first day.",
    items: [
      "New construction and renovation cleanup in schools",
      "Summer and break deep cleans",
      "Hallway, classroom and gym floor care",
      "Restroom and common area detailing",
    ],
  },
  {
    slug: "warehouse-industrial",
    name: "Warehouse & Industrial",
    short: "Machine sweeping, scrubbing, high dusting and docks.",
    image: "/images/warehouse.webp",
    alt: "Operator on a ride-on floor scrubber cleaning the polished concrete floor of a large distribution warehouse",
    intro:
      "Big floors need the right machines and a crew that knows how to work around racking, forklifts and live docks.",
    items: [
      "Ride-on machine sweeping and scrubbing",
      "High dusting of joists, ductwork and racking",
      "Dock and loading area cleanup",
      "Post-construction cleans for new distribution buildings",
    ],
  },
  {
    slug: "window-floor-care",
    name: "Window & Floor Care",
    short: "Storefront glass, carpet, VCT, buffing, sealing, concrete.",
    image: "/images/window-floor.webp",
    alt: "Technician in a dark green polo squeegeeing a storefront window on a sunny city street",
    intro:
      "Glass and floors are what people notice first at a walkthrough. We handle both with the right tools for each surface.",
    items: [
      "Storefront and interior glass, streak-free",
      "Carpet cleaning and extraction",
      "VCT strip, wax and buffing",
      "Floor sealing and finishing",
      "Concrete cleaning and polishing support",
    ],
  },
  {
    slug: "specialty",
    name: "Specialty Cleaning",
    short: "Turnovers, pressure washing, fire and soot support, emergencies.",
    image: "/images/specialty.webp",
    alt: "Technician in a green shirt pressure washing a concrete entry walk outside a brick commercial building",
    intro: "The jobs that do not fit a standard scope. Tell us what happened and when you need it done.",
    items: [
      "Tenant and unit turnovers",
      "Pressure washing for walks, entries and dumpster pads",
      "Fire and soot cleanup support",
      "Pre-paint cleaning",
      "Emergency and short-notice cleaning",
    ],
  },
];

export const INDUSTRIES = [
  {
    name: "General Contractors",
    body: "Phased construction cleaning that tracks your schedule, keeps trades moving and gets the building turnover-ready on the date you promised.",
    primary: true,
  },
  {
    name: "Property Managers",
    body: "Unit turnovers, common areas and recurring service for managed and multi-tenant buildings.",
  },
  {
    name: "Schools",
    body: "Break and summer work, renovation cleanup and floor care planned around the academic calendar.",
  },
  {
    name: "Warehouse & Distribution",
    body: "Machine sweeping and scrubbing, high dusting and dock cleanup for large footprints.",
  },
  {
    name: "Churches & Nonprofits",
    body: "Reliable recurring cleaning and event-ready spaces, scoped to the budget you have.",
  },
  {
    name: "Government",
    body: "Clean, consistent service for public buildings, with crews that follow site rules and access requirements.",
  },
];

export const AREAS = [
  {
    slug: "nashville",
    name: "Greater Nashville & Middle Tennessee",
    short: "Nashville",
    image: "/images/nashville.webp",
    alt: "Nashville skyline at sunset with tower cranes over new construction beside the Cumberland River",
    body: "Middle Tennessee is building fast, and closeout schedules are tight. We support general contractors and property managers across the Nashville metro and surrounding Middle Tennessee communities.",
  },
  {
    slug: "central-pa",
    name: "Central Pennsylvania",
    short: "Central PA",
    image: "/images/central-pa.webp",
    alt: "Central Pennsylvania river valley with bridges, a small city and a new commercial building under construction in the foreground",
    body: "From new commercial builds to schools and distribution buildings, we bring the same phased, schedule-first approach to projects across Central Pennsylvania.",
  },
];

export const NAV = [
  { href: "/services", label: "Services" },
  { href: "/industries", label: "Industries" },
  { href: "/service-areas", label: "Service Areas" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
];
