export const site = {
  name: "Damilare Osofisan",
  role: "Product Designer",
  headline: "Product Designer building 0–1 products",
  location: "Lagos, Nigeria",
  /* Where the site actually is, and it has to be the live one: every absolute
     URL the site emits — og:image, twitter:image, the canonical, the sitemap's
     rows, robots' sitemap line — is resolved against this.

     When the custom domain is bought and pointed at the deployment, this is the
     one line that changes. `data/site.test.ts` holds it to a host that answers
     so the same mistake cannot land twice. */
  url: "https://damilareoo.xyz",
  email: "dosofisan7@gmail.com",
  linkedin: "https://www.linkedin.com/in/damilareoo",
};

/* Only links that are known to exist. A portfolio that lists an empty profile
   is worse than one that lists none. */
export const elsewhere = [
  { label: "LinkedIn", handle: "damilareoo", href: site.linkedin },
  { label: "Email", handle: site.email, href: `mailto:${site.email}` },
];
