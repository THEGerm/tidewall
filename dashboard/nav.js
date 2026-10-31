// The same bar on every page: the site's sections, with the current one marked.
// Signed-in pages (Control, Ledger, My keys) ask for the email PIN on first use.
(() => {
  const links = [
    ["/", "Runs"],
    ["/me/control/", "Control"],
    ["/me/ledger/", "Ledger"],
    ["/me/", "My keys"],
  ];
  const here = location.pathname;
  const nav = document.createElement("nav");
  nav.className = "site";
  nav.setAttribute("aria-label", "Tidewall");
  const brand = document.createElement("a");
  brand.href = "/";
  brand.className = "brand";
  brand.textContent = "Tidewall";
  nav.append(brand);
  const list = document.createElement("div");
  list.className = "site-links";
  for (const [href, label] of links) {
    const a = document.createElement("a");
    a.href = href;
    a.textContent = label;
    const current = href === "/" ? here === "/" || here.startsWith("/run/") : here === href || (href !== "/me/" && here.startsWith(href));
    if (current) a.setAttribute("aria-current", "page");
    list.append(a);
  }
  nav.append(list);
  document.body.prepend(nav);
})();
