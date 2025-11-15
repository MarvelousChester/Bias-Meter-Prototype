export type EbscoDefinition = {
  Term: string;
  Definition: string;
  Link: string;
};

/**
 * Fetch definition from the FastAPI endpoint added in `PoliticalDefintionScraperAPI.py`
 * Calls: GET /api/python/definition/{keyword}
 * Returns an object with Term, Definition and Link.
 */
//TODO: Use database caching to avoid repeated calls for same keyword
export async function fetchDefinition(
  keyword: string
): Promise<EbscoDefinition> {
  // Fetch definition from database

  // If Definition not found
  // Fetch definition from EBSCO API

  const encoded_keyword = encodeURIComponent(keyword);

  const res = await fetch(`/api/python/definition/${encoded_keyword}`);
  if (!res.ok) {
    throw new Error("Failed to fetch definition");
  }
  const json = await res.json();
  // Basic runtime validation: ensure keys exist
  if (!json || typeof json.Definition !== "string") {
    throw new Error("Unexpected response shape from definition endpoint");
  }
  // save the fetched definition to the database here for caching
  return json as EbscoDefinition;
}
