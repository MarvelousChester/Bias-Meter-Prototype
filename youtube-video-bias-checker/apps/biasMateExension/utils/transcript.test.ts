import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import { getTranscript, TranscriptItem } from "./transcript";
import { YoutubeTranscript } from "youtube-transcript-plus";

// Mock youtube-transcript-plus
vi.mock("youtube-transcript-plus", () => ({
  YoutubeTranscript: {
    fetchTranscript: vi.fn(),
  },
}));

describe("transcript", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("getTranscript", () => {
    // Sample library response format (offset, not start)
    const mockLibraryResponse = [
      { text: "Hello world", offset: 0, duration: 2.5 },
      { text: "This is a test", offset: 2.5, duration: 3.0 },
      { text: "End of transcript", offset: 5.5, duration: 2.0 },
    ];

    // Expected mapped output
    const expectedTranscript: TranscriptItem[] = [
      { text: "Hello world", start: 0, duration: 2.5 },
      { text: "This is a test", start: 2.5, duration: 3.0 },
      { text: "End of transcript", start: 5.5, duration: 2.0 },
    ];

    it("should return mapped transcript items on success", async () => {
      (YoutubeTranscript.fetchTranscript as Mock).mockResolvedValue(
        mockLibraryResponse
      );

      const result = await getTranscript("validVideoId123");

      expect(YoutubeTranscript.fetchTranscript).toHaveBeenCalledWith(
        "validVideoId123"
      );
      expect(result).toEqual(expectedTranscript);
    });

    it("should map offset to start field correctly", async () => {
      const singleItem = [{ text: "Test", offset: 10.5, duration: 5.0 }];
      (YoutubeTranscript.fetchTranscript as Mock).mockResolvedValue(singleItem);

      const result = await getTranscript("videoId");

      expect(result).toEqual([{ text: "Test", start: 10.5, duration: 5.0 }]);
    });

    it("should return null when transcript is empty array", async () => {
      (YoutubeTranscript.fetchTranscript as Mock).mockResolvedValue([]);

      const result = await getTranscript("videoWithNoTranscript");

      expect(result).toBeNull();
    });

    it("should return null when transcript is null", async () => {
      (YoutubeTranscript.fetchTranscript as Mock).mockResolvedValue(null);

      const result = await getTranscript("nullTranscriptVideo");

      expect(result).toBeNull();
    });

    it("should return null when transcript is undefined", async () => {
      (YoutubeTranscript.fetchTranscript as Mock).mockResolvedValue(undefined);

      const result = await getTranscript("undefinedTranscriptVideo");

      expect(result).toBeNull();
    });

    it("should return null and log error when fetch throws", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      (YoutubeTranscript.fetchTranscript as Mock).mockRejectedValue(
        new Error("Network error")
      );

      const result = await getTranscript("errorVideo");

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Bias Mate: Error fetching transcript with youtube-transcript-plus",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should handle video not found errors gracefully", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      (YoutubeTranscript.fetchTranscript as Mock).mockRejectedValue(
        new Error("Video not found")
      );

      const result = await getTranscript("nonExistentVideo");

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });

    it("should handle transcript disabled errors gracefully", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      (YoutubeTranscript.fetchTranscript as Mock).mockRejectedValue(
        new Error("Transcript is disabled for this video")
      );

      const result = await getTranscript("disabledTranscriptVideo");

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });

    it("should pass videoId to fetchTranscript correctly", async () => {
      (YoutubeTranscript.fetchTranscript as Mock).mockResolvedValue(
        mockLibraryResponse
      );

      await getTranscript("abc123XYZ");

      expect(YoutubeTranscript.fetchTranscript).toHaveBeenCalledWith("abc123XYZ");
      expect(YoutubeTranscript.fetchTranscript).toHaveBeenCalledTimes(1);
    });

    it("should handle large transcripts", async () => {
      // Generate 1000 items
      const largeTranscript = Array.from({ length: 1000 }, (_, i) => ({
        text: `Line ${i + 1}`,
        offset: i * 2,
        duration: 2,
      }));
      (YoutubeTranscript.fetchTranscript as Mock).mockResolvedValue(
        largeTranscript
      );

      const result = await getTranscript("longVideo");

      expect(result).toHaveLength(1000);
      expect(result?.[0]).toEqual({ text: "Line 1", start: 0, duration: 2 });
      expect(result?.[999]).toEqual({ text: "Line 1000", start: 1998, duration: 2 });
    });

    it("should preserve special characters in text", async () => {
      const specialCharsTranscript = [
        { text: "Hello 👋 <b>world</b>", offset: 0, duration: 1 },
        { text: "Test & \"quotes\" 'apostrophe'", offset: 1, duration: 1 },
      ];
      (YoutubeTranscript.fetchTranscript as Mock).mockResolvedValue(
        specialCharsTranscript
      );

      const result = await getTranscript("specialCharsVideo");

      expect(result?.[0].text).toBe("Hello 👋 <b>world</b>");
      expect(result?.[1].text).toBe("Test & \"quotes\" 'apostrophe'");
    });

    it("should handle empty string videoId", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      (YoutubeTranscript.fetchTranscript as Mock).mockRejectedValue(
        new Error("Invalid video ID")
      );

      const result = await getTranscript("");

      expect(result).toBeNull();
      expect(YoutubeTranscript.fetchTranscript).toHaveBeenCalledWith("");
      consoleSpy.mockRestore();
    });

    it("should handle null videoId", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      (YoutubeTranscript.fetchTranscript as Mock).mockRejectedValue(
        new Error("Invalid video ID")
      );

      const result = await getTranscript(null as unknown as string);

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });

    it("should handle undefined videoId", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      (YoutubeTranscript.fetchTranscript as Mock).mockRejectedValue(
        new Error("Invalid video ID")
      );

      const result = await getTranscript(undefined as unknown as string);

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });
  });
});
