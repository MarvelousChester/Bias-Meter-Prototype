import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { extractDefinition, scrapeEbscoDefinition } from "./ebscoDefinition";

// Load the HTML fixture
const fixtureHtml = readFileSync(
  resolve(__dirname, "./__fixtures__/liberalism-ebsco.htm"),
  "utf-8"
);

describe("ebscoDefinition", () => {
  describe("extractDefinition", () => {
    it("should extract definition from valid EBSCO HTML", () => {
      const result = extractDefinition(fixtureHtml);

      expect(result).not.toBeNull();
      expect(result).toContain(
        "Liberalism, particularly in the context of American politics"
      );
    });

    it("should return null when title heading is missing", () => {
      const html = `
        <html>
          <body>
            <div><p>Some content without proper heading</p></div>
          </body>
        </html>
      `;

      const result = extractDefinition(html);
      expect(result).toBeNull();
    });

    it("should return null when no div follows the heading", () => {
      const html = `
        <html>
          <body>
            <h1 id="research-starter-title">Test Term</h1>
            <p>Orphan paragraph not in a div</p>
          </body>
        </html>
      `;

      const result = extractDefinition(html);
      expect(result).toBeNull();
    });

    it("should return null when div has no paragraph", () => {
      const html = `
        <html>
          <body>
            <h1 id="research-starter-title">Test Term</h1>
            <div>
              <span>Content in span, not paragraph</span>
            </div>
          </body>
        </html>
      `;

      const result = extractDefinition(html);
      expect(result).toBeNull();
    });

    it("should trim whitespace from extracted text", () => {
      const html = `
        <html>
          <body>
            <h1 id="research-starter-title">Test Term</h1>
            <div>
              <p>   Trimmed definition text   </p>
            </div>
          </body>
        </html>
      `;

      const result = extractDefinition(html);
      expect(result).toBe("Trimmed definition text");
    });

    it("should return null for empty paragraph", () => {
      const html = `
        <html>
          <body>
            <h1 id="research-starter-title">Test Term</h1>
            <div>
              <p>   </p>
            </div>
          </body>
        </html>
      `;

      const result = extractDefinition(html);
      expect(result).toBeNull();
    });
  });

  describe("scrapeEbscoDefinition", () => {
    beforeEach(() => {
      vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("should return 'Definition not found' when website returns 404", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });
      vi.stubGlobal("fetch", mockFetch);

      const result = await scrapeEbscoDefinition("nonexistent-term");

      expect(result).toEqual({
        Term: "nonexistent-term",
        Definition: "Definition not found.",
        Link: "",
      });
    });

    it("should return 'Definition not found' when fetch throws network error", async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));
      vi.stubGlobal("fetch", mockFetch);

      const result = await scrapeEbscoDefinition("network-error-term");

      expect(result).toEqual({
        Term: "network-error-term",
        Definition: "Definition not found.",
        Link: "",
      });
    });

    it("should throw error for empty keyword", async () => {
      await expect(scrapeEbscoDefinition("  ")).rejects.toThrow(
        "Keyword is empty"
      );
    });
  });
});
