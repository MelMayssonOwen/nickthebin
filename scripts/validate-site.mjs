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

const indexHtml = await readFile("index.html", "utf8");
const articleFile = "blog/two-tier-policing-in-the-uk.html";
const articleHtml = await readFile(articleFile, "utf8");

for (const [file, html] of [["index.html", indexHtml], [articleFile, articleHtml]]) {
  assertSnippetEligible(html, file);
  assert(/<link\s+rel=["']canonical["']\s+href=["']https:\/\/nickthebin\.com\//i.test(html), `${file}: missing canonical URL`);
  assert(/<h1[\s>]/i.test(html), `${file}: citable HTML must include a server-delivered h1`);

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
}

const indexNodes = schemaNodes(indexHtml, "index.html");
const application = indexNodes.find((node) => hasType(node, "SoftwareApplication"));
assert(application && hasType(application, "VideoGame"), "index.html: product must be typed as SoftwareApplication and VideoGame");
assert(application.offers?.price === "0", "index.html: free offer must match the visible product description");
assert(/single-player browser game with six London-themed stages/i.test(indexHtml), "index.html: core product facts must be in initial HTML");

const articleNodes = schemaNodes(articleHtml, articleFile);
const article = articleNodes.find((node) => hasType(node, "BlogPosting"));
assert(article?.datePublished, `${articleFile}: BlogPosting needs datePublished`);
assert(article?.dateModified, `${articleFile}: BlogPosting needs dateModified`);
const visibleDates = [...articleHtml.matchAll(/<time\s+datetime=["']([^"']+)["']/gi)].map((match) => match[1]);
assert(visibleDates.includes(article.datePublished), `${articleFile}: datePublished must be visible`);
assert(visibleDates.includes(article.dateModified), `${articleFile}: dateModified must be visible`);

const sitemap = await readFile("sitemap.xml", "utf8");
assert(sitemap.includes("https://nickthebin.com/"), "sitemap.xml: missing home page");
assert(sitemap.includes("https://nickthebin.com/blog/two-tier-policing-in-the-uk.html"), "sitemap.xml: missing article");
assert(sitemap.includes("<lastmod>2026-07-14</lastmod>"), "sitemap.xml: missing truthful home-page lastmod");
assert(sitemap.includes("<lastmod>2026-06-05</lastmod>"), "sitemap.xml: missing truthful article lastmod");

for (const file of (await readdir("src")).filter((name) => name.endsWith(".js"))) {
  const source = await readFile(`src/${file}`, "utf8");
  new Script(source, { filename: `src/${file}` });
}

console.log("Build validation passed: crawler access, snippets, JSON-LD, dates, sitemap, and JavaScript syntax.");
