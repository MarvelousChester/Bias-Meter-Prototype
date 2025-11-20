import { supabase } from "../lib/supabase";

export type EbscoDefinition = {
  Term: string;
  Definition: string;
  Link: string;
};

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
 * Fetch definition from the FastAPI endpoint
 * @param keyword - The political term to look up
 * @returns Definition from the API
 */
async function fetchDefinitionFromAPI(
  keyword: string
): Promise<EbscoDefinition> {
  const encoded_keyword = encodeURIComponent(keyword.trim());

  const res = await fetch(`/api/python/definition/${encoded_keyword}`);
  if (!res.ok) {
    throw new Error("Failed to fetch definition");
  }
  const json = await res.json();

  // Validate API response
  if (
    !json ||
    typeof json.Definition !== "string" ||
    json.Definition.trim() === ""
  ) {
    throw new Error("Unexpected response shape from definition endpoint");
  }

  return json as EbscoDefinition;
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
 * First checks database cache, then falls back to FastAPI if not found
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

  // Fetch from API if not cached
  const definition = await fetchDefinitionFromAPI(keyword);

  // Cache the result for future requests
  await cacheDefinition(definition);

  return definition;
}
