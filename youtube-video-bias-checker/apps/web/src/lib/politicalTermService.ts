import { supabase } from "../lib/supabase";
import { scrapeEbscoDefinition } from "./ebscoDefinition";
import type { EbscoDefinition } from "@bias-mate/shared";

/**
 * Fetch definition from database cache
 * @param keyword - The political term to look up
 * @returns Definition if found, null otherwise
 */
async function getDefinitionFromCache(
  keyword: string
): Promise<EbscoDefinition | null> {
  const normalizedKeyword = keyword.trim();

  const { data, error } = await supabase
    .from("political_terms")
    .select("Keyword, Definition, Link")
    .ilike("Keyword", normalizedKeyword)
    .maybeSingle();

  // Only return cached data if all required fields are valid non-empty strings
  if (
    !error &&
    data &&
    typeof data.Definition === "string" &&
    data.Definition.trim() !== "" &&
    typeof data.Link === "string" &&
    data.Link.trim() !== ""
  ) {
    return {
      Term: data.Keyword || normalizedKeyword,
      Definition: data.Definition,
      Link: data.Link,
    };
  }

  return null;
}

/**
 * Save definition to database cache
 * @param definition - The definition to cache
 */
async function cacheDefinition(definition: EbscoDefinition): Promise<void> {
  try {
    const { error: insertError } = await supabase
      .from("political_terms")
      .upsert(
        {
          Keyword: definition.Term,
          Definition: definition.Definition,
          Link: definition.Link || "",
        },
        {
          onConflict: "Keyword",
          ignoreDuplicates: false,
        }
      );

    if (insertError) {
      console.error("Failed to cache definition:", insertError);
    }
  } catch (err) {
    console.error("Error caching definition to database:", err);
  }
}

/**
 * Fetch definition with caching strategy
 * First checks database cache, then falls back to the HTML scraper if not found
 * @param keyword - The political term to look up
 * @returns Definition object with Term, Definition and Link
 */
export async function fetchDefinition(
  keyword: string
): Promise<EbscoDefinition> {
  // Try to get from cache first
  const cachedDefinition = await getDefinitionFromCache(keyword);
  if (cachedDefinition) {
    return cachedDefinition;
  }

  try {
    const definition = await scrapeEbscoDefinition(keyword);

    if (
      !definition ||
      typeof definition.Definition !== "string" ||
      definition.Definition.trim() === "" ||
      typeof definition.Link !== "string"
    ) {
      throw new Error("Invalid response shape");
    }

    // Cache the result for future requests
    await cacheDefinition(definition);

    return definition;
  } catch (err) {
    const reason = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`Scraper Failed: ${reason}`);
  }
}
