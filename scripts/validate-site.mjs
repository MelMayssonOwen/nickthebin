import { readFile, readdir } from "node:fs/promises";
import { Script } from "node:vm";

const REQUIRED_AI_CRAWLERS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "Claude-SearchBot",
  "Claude-User",
  "Googlebot",
  "Bingbot",
  "GPTBot",
  "ClaudeBot",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function schemaNodes(html, file) {
  const matches = [...html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  assert(matches.length > 0, `${file}: missing JSON-LD`);

  return matches.flatMap((match) => {
    let value;
    try {
      value = JSON.parse(match[1]);
    } catch (error) {
      throw new Error(`${file}: invalid JSON-LD (${error.message})`);
    }
    return Array.isArray(value["@graph"]) ? value["@graph"] : [value];
  });
}

function hasType(node, type) {
  const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
  return types.includes(type);
}

function assertSnippetEligible(html, file) {
  const robots = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i)?.[1]?.toLowerCase();
  assert(robots, `${file}: missing robots meta tag`);
  assert(robots.includes("index") && robots.includes("follow"), `${file}: must remain indexable and followable`);
  assert(robots.includes("max-snippet:-1"), `${file}: snippets are not explicitly unrestricted`);
  assert(!/(?:^|[,\s])noindex(?:$|[,\s])/.test(robots), `${file}: noindex is not allowed`);
  assert(!/(?:^|[,\s])nosnippet(?:$|[,\s])/.test(robots), `${file}: nosnippet is not allowed`);
  assert(!/data-nosnippet/i.test(html), `${file}: data-nosnippet is not allowed`);
  assert(!/(?:noarchive|nocache)/i.test(robots), `${file}: restrictive archive directives are not allowed`);
}

const LOCALES = ["en", "es", "fr", "it", "pt"];
const ALTERNATE_LOCALES = [...LOCALES, "x-default"];

function localePrefix(locale) {
  return locale === "en" ? "" : `${locale}/`;
}

function assertHreflangSet(html, file, expectedHrefs) {
  const found = [...html.matchAll(/<link\s+rel=["']alternate["']\s+hreflang=["']([^"']+)["']\s+href=["']([^"']+)["']\s*\/?>/gi)]
    .reduce((map, m) => { map[m[1]] = m[2]; return map; }, {});
  for (const [hreflang, href] of Object.entries(expectedHrefs)) {
    assert(found[hreflang] === href, `${file}: hreflang "${hreflang}" missing or wrong (expected ${href}, got ${found[hreflang]})`);
  }
  assert(Object.keys(found).length === ALTERNATE_LOCALES.length, `${file}: hreflang set must have exactly ${ALTERNATE_LOCALES.length} entries (en/es/fr/it/pt/x-default), found ${Object.keys(found).length}`);
}

const robotsText = await readFile("robots.txt", "utf8");
const robotsBlocks = robotsText
  .split(/\n\s*\n/)
  .map((block) => block.split("\n").map((line) => line.replace(/\s+#.*$/, "").trim()).filter(Boolean));

for (const crawler of REQUIRED_AI_CRAWLERS) {
  const blocks = robotsBlocks.filter((block) => block.some((line) => line.toLowerCase() === `user-agent: ${crawler.toLowerCase()}`));
  assert(blocks.length === 1, `robots.txt: ${crawler} must have one separate user-agent block`);
  assert(blocks[0].filter((line) => /^user-agent:/i.test(line)).length === 1, `robots.txt: ${crawler} must not share its block`);
  assert(blocks[0].some((line) => /^allow:\s*\/$/i.test(line)), `robots.txt: ${crawler} must allow /`);
  assert(!blocks[0].some((line) => /^disallow:/i.test(line)), `robots.txt: ${crawler} must not be blocked`);
}
assert(/Sitemap:\s*https:\/\/nickthebin\.com\/sitemap\.xml/i.test(robotsText), "robots.txt: missing canonical sitemap reference");

function expectedAlternates(kind) {
  const map = {};
  for (const locale of LOCALES) {
    const prefix = localePrefix(locale);
    map[locale] = kind === "home"
      ? `https://nickthebin.com/${prefix}`
      : `https://nickthebin.com/${prefix}blog/two-tier-policing-in-the-uk.html`;
  }
  map["x-default"] = map["en"];
  return map;
}

const indexHtml = await readFile("index.html", "utf8");

const localePages = {};
for (const locale of LOCALES) {
  const prefix = localePrefix(locale);
  const homeFile = `${prefix}index.html`;
  const localeArticleFile = `${prefix}blog/two-tier-policing-in-the-uk.html`;
  localePages[locale] = {
    home: { file: homeFile, html: await readFile(homeFile, "utf8"), canonical: `https://nickthebin.com/${prefix}` },
    article: { file: localeArticleFile, html: await readFile(localeArticleFile, "utf8"), canonical: `https://nickthebin.com/${prefix}blog/two-tier-policing-in-the-uk.html` },
  };
}

for (const locale of LOCALES) {
  for (const kind of ["home", "article"]) {
    const { file, html, canonical } = localePages[locale][kind];
    assertSnippetEligible(html, file);
    assert(html.includes(`<link rel="canonical" href="${canonical}" />`), `${file}: canonical must be self-referencing (${canonical})`);
    assert(/<h1[\s>]/i.test(html), `${file}: citable HTML must include a server-delivered h1`);
    assert(new RegExp(`<html\\s+lang=["']${locale}["']`, "i").test(html), `${file}: <html lang> must be "${locale}"`);
    assertHreflangSet(html, file, expectedAlternates(kind));

    const nodes = schemaNodes(html, file);
    const organization = nodes.find((node) => hasType(node, "Organization"));
    const website = nodes.find((node) => hasType(node, "WebSite"));
    assert(organization?.["@id"] === "https://nickthebin.com/#organization", `${file}: missing stable Organization entity`);
    assert(Array.isArray(organization.sameAs), `${file}: Organization sameAs must be an array`);
    for (const url of organization.sameAs) {
      assert(new URL(url).protocol === "https:", `${file}: sameAs entries must be real HTTPS URLs`);
    }
    assert(website?.["@id"] === "https://nickthebin.com/#website", `${file}: missing stable WebSite entity`);
    assert(website.publisher?.["@id"] === organization["@id"], `${file}: WebSite publisher must reference the Organization`);

    if (kind === "home") {
      const application = nodes.find((node) => hasType(node, "SoftwareApplication"));
      assert(application && hasType(application, "VideoGame"), `${file}: product must be typed as SoftwareApplication and VideoGame`);
      assert(application.offers?.price === "0", `${file}: free offer must match the visible product description`);
    } else {
      const article = nodes.find((node) => hasType(node, "BlogPosting"));
      assert(article?.datePublished, `${file}: BlogPosting needs datePublished`);
      assert(article?.dateModified, `${file}: BlogPosting needs dateModified`);
      const visibleDates = [...html.matchAll(/<time\s+datetime=["']([^"']+)["']/gi)].map((match) => match[1]);
      assert(visibleDates.includes(article.datePublished), `${file}: datePublished must be visible`);
      assert(visibleDates.includes(article.dateModified), `${file}: dateModified must be visible`);
    }
  }
}
assert(/single-player browser game with six London-themed stages/i.test(indexHtml), "index.html: core product facts must be in initial HTML");

const sitemap = await readFile("sitemap.xml", "utf8");
assert(sitemap.includes("https://nickthebin.com/"), "sitemap.xml: missing home page");
assert(sitemap.includes("https://nickthebin.com/blog/two-tier-policing-in-the-uk.html"), "sitemap.xml: missing article");
assert(sitemap.includes("<lastmod>2026-08-09</lastmod>"), "sitemap.xml: missing truthful home-page lastmod");
assert(sitemap.includes("<lastmod>2026-06-05</lastmod>"), "sitemap.xml: missing truthful article lastmod");
for (const locale of LOCALES) {
  const prefix = localePrefix(locale);
  assert(sitemap.includes(`<loc>https://nickthebin.com/${prefix}</loc>`), `sitemap.xml: missing ${locale} home page`);
  assert(sitemap.includes(`<loc>https://nickthebin.com/${prefix}blog/two-tier-policing-in-the-uk.html</loc>`), `sitemap.xml: missing ${locale} article`);
}

for (const file of (await readdir("src")).filter((name) => name.endsWith(".js"))) {
  const source = await readFile(`src/${file}`, "utf8");
  new Script(source, { filename: `src/${file}` });
}

console.log("Build validation passed: crawler access, snippets, JSON-LD, dates, sitemap, and JavaScript syntax.");
