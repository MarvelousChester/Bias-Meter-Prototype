import { supabase } from "./supabase";
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
    .select("term, definition, source_url")
    .ilike("term", normalizedKeyword)
    .maybeSingle();

  // Only return cached data if all required fields are valid non-empty strings
  if (
    !error &&
    data &&
    typeof data.definition === "string" &&
    data.definition.trim() !== "" &&
    typeof data.source_url === "string" &&
    data.source_url.trim() !== ""
  ) {
    return {
      Term: data.term || normalizedKeyword,
      Definition: data.definition,
      Link: data.source_url,
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
          term: definition.Term,
          definition: definition.Definition,
          source_url: definition.Link || "",
        },
        {
          onConflict: "term",
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
 * @param modifier - Optional modifier (e.g. anti, pro, neo)
 * @returns Definition object with Term, Definition and Link
 */
export async function fetchDefinition(
  keyword: string,
  modifier?: "pro" | "anti" | "neo" | "post" | "proto"
): Promise<EbscoDefinition> {
  // Try to get from cache first
  let definition = await getDefinitionFromCache(keyword);

  if (!definition) {
    try {
      definition = await scrapeEbscoDefinition(keyword);

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
    } catch (err) {
      const reason = err instanceof Error ? err.message : "Unknown error";
      throw new Error(`Scraper Failed: ${reason}`);
    }
  }

  // Apply modifier logic
  if (modifier) {
    let prefix = "";
    let capitalizedPrefix = "";
    
    switch (modifier) {
      case "anti":
        prefix = "Opposition to or rejection of: ";
        capitalizedPrefix = "Anti-";
        break;
      case "pro":
        prefix = "Advocacy or support for: ";
        capitalizedPrefix = "Pro-";
        break;
      case "neo":
        prefix = "A modern revival or reinterpretation of: ";
        capitalizedPrefix = "Neo-";
        break;
      case "post":
        prefix = "A perspective that moves beyond or after: ";
        capitalizedPrefix = "Post-";
        break;
      case "proto":
        prefix = "An early or foundational form of: ";
        capitalizedPrefix = "Proto-";
        break;
    }

    if (prefix) {
      definition = {
        ...definition,
        Term: `${capitalizedPrefix}${definition.Term}`,
        Definition: `${prefix}${definition.Definition}`
      };
    }
  }

  return definition;
}
