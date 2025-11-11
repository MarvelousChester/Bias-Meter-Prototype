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
export async function fetchDefinition(
  keyword: string
): Promise<EbscoDefinition> {
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
  return json as EbscoDefinition;
}
