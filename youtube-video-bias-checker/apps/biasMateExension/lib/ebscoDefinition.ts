import { load } from "cheerio";
import type { AnyNode } from "domhandler";
import { ElementType } from "domelementtype";
import { EbscoDefinition } from "@bias-mate/shared";

const URL_TEMPLATES = [
  "https://www.ebsco.com/research-starters/diplomacy-and-international-relations/{keyword}",
  "https://www.ebsco.com/research-starters/political-science/{keyword}",
  "https://www.ebsco.com/research-starters/history/{keyword}",
  "https://www.ebsco.com/research-starters/psychology/{keyword}",
];

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

const TIMEOUT_MS = 10_000;
const MAX_ATTEMPTS_PER_KEYWORD = 2;
const attemptCounts = new Map<string, number>();

async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

export function extractDefinition(html: string): string | null {
  const $ = load(html);
  const heading = $("h1#research-starter-title").first();
  if (!heading.length) return null;

  // Advance to the next sibling, skipping text nodes
  let nextNode: AnyNode | null | undefined = heading[0]?.nextSibling;
  while (nextNode && nextNode.type === ElementType.Text) {
    nextNode = nextNode.nextSibling;
  }

  if (
    !nextNode ||
    nextNode.type !== ElementType.Tag ||
    nextNode.name !== "div"
  ) {
    return null;
  }

  const firstParagraph = $(nextNode).find("p").first();
  const text = firstParagraph.text().trim();
  return text || null;
}

export async function scrapeEbscoDefinition(
  keyword: string
): Promise<EbscoDefinition> {
  const term = keyword.trim();
  const normalizedKey = term.toLowerCase();

  if (!term) {
    throw new Error("Keyword is empty");
  }

  const attempts = attemptCounts.get(normalizedKey) ?? 0;
  if (attempts >= MAX_ATTEMPTS_PER_KEYWORD) {
    throw new Error("Retry limit reached");
  }

  for (const template of URL_TEMPLATES) {
    const url = template.replace(
      "{keyword}",
      encodeURIComponent(normalizedKey)
    );

    try {
      const html = await fetchHtml(url);
      const definition = extractDefinition(html);
      if (definition) {
        attemptCounts.delete(normalizedKey);
        return {
          Term: term,
          Definition: definition,
          Link: url,
        };
      }
    } catch (err) {
      // Log raw scrape errors for debugging, but continue trying other templates
      console.error(`Scrape error for ${url}:`, err);
    }
  }

  attemptCounts.set(normalizedKey, attempts + 1);

  return {
    Term: term,
    Definition: "Definition not found.",
    Link: "",
  };
}
