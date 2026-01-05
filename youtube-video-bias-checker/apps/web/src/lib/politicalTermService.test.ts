import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import { fetchDefinition } from "./politicalTermService";
import { supabase } from "./supabase";
import { scrapeEbscoDefinition } from "./ebscoDefinition";

// Mock Supabase
vi.mock("./supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock("./ebscoDefinition", () => ({
  scrapeEbscoDefinition: vi.fn(),
}));

describe("politicalTermService", () => {
  const maybeSingleMock = vi.fn();
  const ilikeMock = vi.fn();
  const selectMock = vi.fn();
  const upsertMock = vi.fn();
  const fromMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup Supabase mock chain
    ilikeMock.mockReturnValue({ maybeSingle: maybeSingleMock });
    selectMock.mockReturnValue({ ilike: ilikeMock });
    fromMock.mockReturnValue({
      select: selectMock,
      upsert: upsertMock,
    });
    (supabase.from as unknown as Mock).mockImplementation(fromMock);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("fetchDefinition", () => {
    it("should return cached definition if found in Supabase", async () => {
      const mockData = {
        Keyword: "Socialism",
        Definition: "A political and economic theory...",
        Link: "http://example.com",
      };

      maybeSingleMock.mockResolvedValue({ data: mockData, error: null });

      const result = await fetchDefinition("Socialism");

      expect(supabase.from).toHaveBeenCalledWith("political_terms");
      expect(selectMock).toHaveBeenCalledWith("Keyword, Definition, Link");
      expect(ilikeMock).toHaveBeenCalledWith("Keyword", "Socialism");
      expect(maybeSingleMock).toHaveBeenCalled();
      expect(result).toEqual({
        Term: "Socialism",
        Definition: "A political and economic theory...",
        Link: "http://example.com",
      });
    });

    it("should scrape and cache if not found in Supabase", async () => {
      // Supabase returns null (not found)
      maybeSingleMock.mockResolvedValue({ data: null, error: null });

      // Scraper returns definition
      const apiResponse = {
        Term: "Socialism",
        Definition: "API Definition",
        Link: "http://api.com",
      };
      (scrapeEbscoDefinition as unknown as Mock).mockResolvedValue(apiResponse);

      // Upsert mock
      upsertMock.mockResolvedValue({ error: null });

      const result = await fetchDefinition("Socialism");

      // Check Supabase lookup
      expect(supabase.from).toHaveBeenCalledWith("political_terms");

      // Check scraper call
      expect(scrapeEbscoDefinition).toHaveBeenCalledWith("Socialism");

      // Check Caching
      expect(upsertMock).toHaveBeenCalledWith(
        {
          Keyword: "Socialism",
          Definition: "API Definition",
          Link: "http://api.com",
        },
        {
          onConflict: "Keyword",
          ignoreDuplicates: false,
        }
      );

      expect(result).toEqual(apiResponse);
    });

    it("should throw error if scraper fails", async () => {
      maybeSingleMock.mockResolvedValue({ data: null, error: null });

      (scrapeEbscoDefinition as unknown as Mock).mockRejectedValue(
        new Error("Network down")
      );

      await expect(fetchDefinition("Socialism")).rejects.toThrow(
        "Scraper Failed: Network down"
      );
    });

    it("should throw error if scraper returns invalid shape", async () => {
      maybeSingleMock.mockResolvedValue({ data: null, error: null });
      (scrapeEbscoDefinition as unknown as Mock).mockResolvedValue({
        invalid: "shape",
      });

      await expect(fetchDefinition("Socialism")).rejects.toThrow(
        "Scraper Failed: Invalid response shape"
      );
    });

    it("should handle Supabase error gracefully and try API", async () => {
      // Supabase returns error
      maybeSingleMock.mockResolvedValue({
        data: null,
        error: { message: "DB Error" },
      });

      const apiResponse = {
        Term: "Socialism",
        Definition: "API Definition",
        Link: "http://api.com",
      };
      (scrapeEbscoDefinition as unknown as Mock).mockResolvedValue(apiResponse);
      upsertMock.mockResolvedValue({ error: null });

      const result = await fetchDefinition("Socialism");

      expect(scrapeEbscoDefinition).toHaveBeenCalled();
      expect(result).toEqual(apiResponse);
    });
  });
});
