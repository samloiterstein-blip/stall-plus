import { writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const NEWSAPI_AI_KEY = process.env.NEWSAPI_AI_KEY || "24f12f92-26a1-4b9c-b06f-8d9402f9f151";
const NEWSDATA_KEY = process.env.NEWSDATA_KEY || "pub_aabe6d584a9747e7b8767b5cd8a9e8f4";
const NEWSAPI_ORG_KEY = process.env.NEWSAPI_ORG_KEY || "a0d8a35cca1d444f911ac943ac7bfa13";

const DAY_MS = 24 * 60 * 60 * 1000;
const today = new Date();
const fromDate = new Date(today.getTime() - 14 * DAY_MS).toISOString().slice(0, 10);

const categories = [
  {
    id: "bathroom-peeping",
    label: "Bathroom Peeping / Voyeurism Incidents",
    priority: 1,
    hook: "Turns stall gaps from an inconvenience into an immediate privacy concern.",
    terms: [
      "peeping tom",
      "voyeurism",
      "secretly recording",
      "bathroom spy",
      "bathroom peeping",
      "restroom peeping",
      "bathroom harassment",
      "restroom privacy",
      "stall gap",
      "public bathroom privacy"
    ]
  },
  {
    id: "dorm-privacy",
    label: "Dorm Bathroom Privacy + Shared Living",
    priority: 2,
    hook: "Connects shared bathrooms with portable privacy for students and parents.",
    terms: [
      "dorm bathroom",
      "dorm restroom",
      "shared bathroom",
      "communal bathroom",
      "college bathroom",
      "student privacy",
      "coed bathroom",
      "locker room privacy"
    ]
  },
  {
    id: "hidden-cameras",
    label: "Hidden Cameras in Public Spaces",
    priority: 3,
    hook: "Frames StallPlus as additional privacy protection without overclaiming surveillance prevention.",
    terms: [
      "hidden camera",
      "spy camera",
      "bathroom camera",
      "changing room camera",
      "locker room camera",
      "public restroom camera",
      "airbnb camera"
    ]
  },
  {
    id: "workplace-privacy",
    label: "Return-to-Office Workplace Privacy",
    priority: 4,
    hook: "Gives facilities and HR teams a practical employee-experience improvement.",
    terms: [
      "return to office",
      "workplace privacy",
      "employee experience",
      "office restroom",
      "facility upgrade",
      "workplace comfort",
      "employee wellness"
    ]
  },
  {
    id: "viral-stall-gaps",
    label: "Viral Social Media About US Bathroom Stalls",
    priority: 5,
    hook: "Uses high-awareness stall-gap discourse to make the problem instantly recognizable.",
    terms: [
      "american bathroom stalls",
      "bathroom stall gaps",
      "restroom stall gaps",
      "tiktok bathroom stalls",
      "viral bathroom stall",
      "public bathroom gaps",
      "us bathroom stalls"
    ]
  },
  {
    id: "womens-safety",
    label: "Women's Safety & Vulnerability Stories",
    priority: 6,
    hook: "Centers dignity, comfort, and peace of mind without panic-based messaging.",
    terms: [
      "women safety restroom",
      "women privacy bathroom",
      "bathroom safety",
      "restroom safety",
      "women vulnerable public spaces",
      "student safety bathroom"
    ]
  },
  {
    id: "privacy-culture",
    label: "Broader Privacy Culture / Screen Peeping",
    priority: 7,
    hook: "Supports thought leadership around privacy norms in public and shared spaces.",
    terms: [
      "screen peeping",
      "shoulder surfing",
      "phone privacy",
      "privacy culture",
      "public space privacy",
      "airport privacy",
      "coworking privacy"
    ]
  }
];

const searchTerms = [
  "bathroom privacy",
  "restroom privacy",
  "peeping tom",
  "voyeurism",
  "hidden camera",
  "spy camera",
  "dorm bathroom",
  "shared bathroom",
  "bathroom stall gaps",
  "american bathroom stalls",
  "workplace privacy",
  "employee experience",
  "women safety restroom",
  "shoulder surfing"
];

const newsDataQuery = '"restroom privacy" OR "hidden camera" OR "dorm bathroom" OR voyeurism';

const relevanceTerms = [
  "airbnb camera",
  "american bathroom stalls",
  "bathroom",
  "bathroom safety",
  "bathroom spy",
  "bathroom stall",
  "bathroom stalls",
  "changing room",
  "college bathroom",
  "communal bathroom",
  "coed bathroom",
  "dorm bathroom",
  "employee experience",
  "facility upgrade",
  "gym",
  "hotel camera",
  "locker room",
  "office restroom",
  "peeping tom",
  "phone privacy",
  "public bathroom",
  "public restroom",
  "restroom",
  "restroom safety",
  "screen peeping",
  "secretly recording",
  "shared bathroom",
  "shower privacy",
  "shoulder surfing",
  "spy camera",
  "stall gap",
  "student privacy",
  "toilet",
  "voyeurism",
  "women's restroom",
  "workplace comfort",
  "workplace privacy"
];

const newsApiOrgQuery = [
  '"bathroom privacy"',
  '"restroom privacy"',
  '"peeping tom"',
  "voyeurism",
  '"hidden camera"',
  '"spy camera"',
  '"dorm bathroom"',
  '"shared bathroom"',
  '"bathroom stall gaps"',
  '"american bathroom stalls"',
  '"workplace privacy"',
  '"employee experience"',
  '"shoulder surfing"'
].join(" OR ");

const normalizeText = (value) => String(value || "").replace(/\s+/g, " ").trim();

const toArticle = (provider, item) => {
  const title = normalizeText(item.title || item.name);
  const description = normalizeText(item.description || item.body || item.content || item.summary);
  const url = item.url || item.link || item.uri;

  if (!title || !url) {
    return null;
  }

  return {
    provider,
    title,
    description,
    url,
    source: normalizeText(item.source?.name || item.source_name || item.source?.title || item.source?.uri || provider),
    image: item.urlToImage || item.image_url || item.image || null,
    publishedAt: item.publishedAt || item.pubDate || item.dateTimePub || item.dateTime || null
  };
};

const execFileAsync = promisify(execFile);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchJsonWithNode = async (url, options = {}) => {
  const timeoutMs = options.timeoutMs ?? 15000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(options.headers || {})
      }
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`${response.status} ${response.statusText}: ${message.slice(0, 180)}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
};

const fetchJsonWithCurl = async (url, options = {}) => {
  const args = ["-sS", "-L", "--fail", "--max-time", String((options.timeoutMs ?? 20000) / 1000)];
  const headers = options.headers || {};
  Object.entries(headers).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    args.push("-H", `${key}: ${value}`);
  });
  args.push(String(url));

  const { stdout } = await execFileAsync("curl", args, { maxBuffer: 1024 * 1024 * 10 });
  return JSON.parse(stdout);
};

const fetchJson = async (url, options = {}) => {
  const attempts = options.attempts ?? 2;
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fetchJsonWithNode(url, options);
    } catch (error) {
      lastError = error;
      const message = error?.message || String(error);
      const isNetworky =
        message.includes("fetch failed") ||
        message.includes("ECONNRESET") ||
        message.includes("ENOTFOUND") ||
        message.includes("ETIMEDOUT") ||
        message.includes("aborted");

      if (!isNetworky) {
        throw error;
      }

      try {
        return await fetchJsonWithCurl(url, options);
      } catch (curlError) {
        lastError = curlError;
      }
    }

    if (attempt < attempts) {
      await sleep(300 * attempt);
    }
  }

  throw lastError;
};

const fetchNewsApiOrg = async () => {
  const url = new URL("https://newsapi.org/v2/everything");
  url.searchParams.set("q", newsApiOrgQuery);
  url.searchParams.set("from", fromDate);
  url.searchParams.set("language", "en");
  url.searchParams.set("sortBy", "publishedAt");
  url.searchParams.set("pageSize", "30");

  const json = await fetchJson(url, {
    headers: {
      "X-Api-Key": NEWSAPI_ORG_KEY
    }
  });

  return (json.articles || []).map((item) => toArticle("NewsAPI.org", item)).filter(Boolean);
};

const fetchNewsData = async () => {
  const url = new URL("https://newsdata.io/api/1/latest");
  url.searchParams.set("apikey", NEWSDATA_KEY);
  url.searchParams.set("q", newsDataQuery);
  url.searchParams.set("language", "en");
  url.searchParams.set("country", "us");
  url.searchParams.set("size", "10");

  const json = await fetchJson(url);

  return (json.results || []).map((item) => toArticle("NewsData.io", item)).filter(Boolean);
};

const fetchNewsApiAi = async () => {
  const url = new URL("https://eventregistry.org/api/v1/article/getArticles");
  url.searchParams.set("resultType", "articles");
  url.searchParams.set("keywordOper", "or");
  url.searchParams.set("lang", "eng");
  url.searchParams.set("articlesSortBy", "date");
  url.searchParams.set("articlesCount", "30");
  url.searchParams.set("dateStart", fromDate);
  url.searchParams.set("apiKey", NEWSAPI_AI_KEY);

  searchTerms.forEach((term) => url.searchParams.append("keyword", term));

  const json = await fetchJson(url);
  const results = json.articles?.results || [];

  return results.map((item) => toArticle("NewsAPI.ai", item)).filter(Boolean);
};

const classifyArticle = (article) => {
  const haystack = `${article.title} ${article.description}`.toLowerCase();
  const matches = categories
    .map((category) => {
      const score = category.terms.reduce((total, term) => {
        return total + (haystack.includes(term.toLowerCase()) ? 1 : 0);
      }, 0);

      return { category, score };
    })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score || a.category.priority - b.category.priority);

  return matches[0]?.category || categories[categories.length - 1];
};

const isRelevant = (article) => {
  const haystack = `${article.title} ${article.description}`.toLowerCase();
  return relevanceTerms.some((term) => haystack.includes(term));
};

const buildInsight = (article, category) => {
  const title = article.title.replace(/[.!?]+$/, "");
  return `${category.hook} Use the angle carefully: "${title}" can support messaging around privacy, dignity, and practical restroom upgrades.`;
};

const run = async () => {
  const providerResults = await Promise.allSettled([
    fetchNewsApiAi(),
    fetchNewsData(),
    fetchNewsApiOrg()
  ]);

  const errors = [];
  const articles = [];

  providerResults.forEach((result) => {
    if (result.status === "fulfilled") {
      articles.push(...result.value);
    } else {
      errors.push(result.reason.message);
    }
  });

  const byUrl = new Map();
  articles.forEach((article) => {
    const key = article.url.replace(/[?#].*$/, "");
    if (!byUrl.has(key)) {
      byUrl.set(key, article);
    }
  });

  const classified = [...byUrl.values()]
    .filter(isRelevant)
    .map((article) => {
      const category = classifyArticle(article);
      return {
        ...article,
        category: category.label,
        categoryId: category.id,
        priority: category.priority,
        stallplusAngle: buildInsight(article, category)
      };
    })
    .sort((a, b) => {
      const dateA = new Date(a.publishedAt || 0).getTime();
      const dateB = new Date(b.publishedAt || 0).getTime();
      return a.priority - b.priority || dateB - dateA;
    })
    .slice(0, 9);

  const categoryCounts = categories.map((category) => ({
    id: category.id,
    label: category.label,
    count: classified.filter((article) => article.categoryId === category.id).length
  }));

  const output = {
    updatedAt: today.toISOString(),
    generatedBy: "scripts/update-news.mjs",
    note: "News is categorized for StallPlus messaging. Hidden camera and safety stories should be framed as additional privacy protection, not guaranteed prevention.",
    providerStatus: {
      attempted: ["NewsAPI.ai", "NewsData.io", "NewsAPI.org"],
      errors
    },
    categoryCounts,
    articles: classified
  };

  await writeFile("data/why-stallplus-news.json", `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Wrote ${classified.length} articles to data/why-stallplus-news.json`);

  if (errors.length) {
    console.warn("Provider errors:");
    errors.forEach((error) => console.warn(`- ${error}`));
  }
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
