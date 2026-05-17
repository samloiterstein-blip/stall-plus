const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector("#nav-links");

menuToggle?.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

const filterButtons = document.querySelectorAll(".filter");
const cards = document.querySelectorAll(".product-card");
const demoForm = document.querySelector("[data-demo-form]");
const formStatus = document.querySelector("#demo-request");
const newsGrid = document.querySelector("[data-news-grid]");
const newsMeta = document.querySelector("[data-news-meta]");
const caseButtons = document.querySelectorAll("[data-case]");
const caseStudy = document.querySelector("[data-case-study]");

const caseStudies = {
  office: {
    eyebrow: "Office buildings",
    title: "Make office restrooms feel private enough for daily use.",
    body: "Employee restrooms sit inside the workplace experience. Visible stall gaps make a routine visit feel exposed, especially as offices ask teams to spend more time on site.",
    points: [
      "Why it matters: employees and visitors expect privacy in spaces tied to basic dignity.",
      "What it solves: StallPlus+ closes the line of sight through door and corner gaps without replacing the stall system.",
      "If left unresolved: small restroom complaints become HR friction, facilities tickets, and visible signs of an outdated workplace."
    ]
  },
  healthcare: {
    eyebrow: "Healthcare",
    title: "Protect privacy in facilities built around trust.",
    body: "Patients, visitors, and staff use healthcare restrooms during stressful moments. A visible stall gap can make the facility feel less controlled than the care environment around it.",
    points: [
      "Why it matters: healthcare spaces carry a higher expectation for dignity, discretion, and cleanliness.",
      "What it solves: StallPlus+ blocks exposed sightlines while WallStash and StallStash keep personal items off floors and fixtures.",
      "If left unresolved: restroom discomfort can show up as patient complaints, staff frustration, and avoidable facility blemishes."
    ]
  },
  schools: {
    eyebrow: "Schools",
    title: "Give students privacy in the rooms nobody wants to discuss at board meetings.",
    body: "School restrooms carry social pressure, supervision concerns, and phone-era anxiety. Stall gaps give students one more reason to avoid campus restrooms.",
    points: [
      "Why it matters: students need privacy in shared spaces where embarrassment spreads quickly.",
      "What it solves: StallPlus+ reduces exposed sightlines and gives administrators a visible, practical privacy upgrade.",
      "If left unresolved: restroom avoidance, parent concerns, and student complaints keep landing on administrators."
    ]
  },
  warehouses: {
    eyebrow: "Warehouses",
    title: "Fix high-traffic restroom gaps between shifts.",
    body: "Warehouse teams hit restrooms in waves during breaks and shift changes. Privacy issues become obvious because everyone uses the same limited facilities at the same time.",
    points: [
      "Why it matters: employees need a private reset point during long, physical shifts.",
      "What it solves: StallPlus+ closes gaps without slowing operations, and WallStash gives workers a place for phones, keys, and badges.",
      "If left unresolved: privacy complaints stay unresolved and restroom conditions become another workforce retention irritant."
    ]
  },
  restaurants: {
    eyebrow: "Restaurants",
    title: "Stop the restroom from undercutting the guest experience.",
    body: "A restaurant restroom is part of the visit. A clean dining room loses ground when the restroom feels exposed or poorly equipped.",
    points: [
      "Why it matters: guests judge privacy and cleanliness fast, then carry that judgment back to the table and the review page.",
      "What it solves: StallPlus+ blocks stall gaps, while WallStash and StallStash keep phones, bags, and wallets off questionable surfaces.",
      "If left unresolved: small restroom flaws keep showing up in reviews, staff complaints, and repeat guest hesitation."
    ]
  },
  airports: {
    eyebrow: "Airports",
    title: "Give travelers privacy while bags and stress pile up.",
    body: "Airport restrooms operate under constant volume. Travelers bring luggage, phones, documents, and very little patience for exposed stall gaps.",
    points: [
      "Why it matters: travelers need privacy and item control in one of the most stressful public environments.",
      "What it solves: StallPlus+ blocks sightlines at scale, while WallStash creates a safer surface for personal items.",
      "If left unresolved: visible gaps and floor-level item storage keep dragging down restroom perception in high-traffic terminals."
    ]
  },
  stadiums: {
    eyebrow: "Stadiums",
    title: "Handle event restroom surges without privacy becoming the story.",
    body: "Stadium restrooms face intense traffic before, during, and after events. Guests notice gaps and item-placement problems when lines are long and patience is short.",
    points: [
      "Why it matters: guests need quick access to restrooms that still feel private during peak crowd movement.",
      "What it solves: StallPlus+ closes exposed stall gaps, and StallCaddy or WallStash gives guests a place for phones and small items.",
      "If left unresolved: restroom complaints become part of the event memory, especially in premium areas and family sections."
    ]
  }
};

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");

    cards.forEach((card) => {
      const show = filter === "all" || card.dataset.category === filter;
      card.hidden = !show;
    });
  });
});

caseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const study = caseStudies[button.dataset.case];

    if (!study || !caseStudy) {
      return;
    }

    caseButtons.forEach((item) => {
      item.classList.remove("is-active");
      item.setAttribute("aria-selected", "false");
    });

    button.classList.add("is-active");
    button.setAttribute("aria-selected", "true");

    caseStudy.innerHTML = `
      <p class="eyebrow">${escapeHtml(study.eyebrow)}</p>
      <h2>${escapeHtml(study.title)}</h2>
      <p>${escapeHtml(study.body)}</p>
      <ul>
        ${study.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
      </ul>
      <a class="button primary" href="#contact">Get a Quote</a>
    `;
  });
});

demoForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (formStatus) {
    formStatus.textContent = "Demo request captured. In production, this would route to StallPlus sales or Shopify checkout.";
  }
});

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "recent";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(String(dateValue).replace(" ", "T")));
};

const renderNews = (feed) => {
  if (!newsGrid || !newsMeta) {
    return;
  }

  const updated = formatDate(feed.updatedAt);

  newsMeta.innerHTML = [
    `<span>Updated ${updated}</span>`,
    "<span>Daily privacy scan</span>"
  ].join("");

  if (!feed.articles?.length) {
    newsGrid.innerHTML = `
      <article class="news-card is-empty">
        <span>Daily feed</span>
        <h3>No relevant stories found yet.</h3>
        <p>The updater ran, but the APIs did not return a clean match for today. The section will refresh again on the next daily run.</p>
      </article>
    `;
    return;
  }

  newsGrid.innerHTML = feed.articles
    .map((article) => `
      <article class="news-card">
        <span>${escapeHtml(article.category)}</span>
        <h3>${escapeHtml(article.title)}</h3>
        <p>${escapeHtml(article.stallplusAngle)}</p>
        <p>${escapeHtml(article.source)} · ${formatDate(article.publishedAt)}</p>
        <a href="${safeUrl(article.url)}" target="_blank" rel="noreferrer">Read source</a>
      </article>
    `)
    .join("");
};

const escapeHtml = (value) => String(value || "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;"
})[character]);

const safeUrl = (value) => {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? escapeHtml(url.href) : "#why-stallplus";
  } catch {
    return "#why-stallplus";
  }
};

fetch("data/why-stallplus-news.json", { cache: "no-store" })
  .then((response) => response.json())
  .then(renderNews)
  .catch(() => {
    if (newsMeta) {
      newsMeta.innerHTML = "<span>Daily feed unavailable</span>";
    }
  });
