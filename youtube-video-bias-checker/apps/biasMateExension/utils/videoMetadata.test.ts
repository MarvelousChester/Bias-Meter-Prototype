/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { extractVideoMetadata, VideoMetadata } from "./videoMetadata";
import { extractVideoId } from "@bias-mate/shared";

// Mock @bias-mate/shared
vi.mock("@bias-mate/shared", () => ({
  extractVideoId: vi.fn(),
}));

describe("videoMetadata", () => {
  // Store original window.location
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset document body
    document.body.innerHTML = "";
    
    // Mock window.location
    Object.defineProperty(window, "location", {
      value: { href: "https://www.youtube.com/watch?v=abc123" },
      writable: true,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
    // Restore window.location
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
  });

  describe("extractVideoMetadata", () => {
    it("should return null when no video ID can be extracted", () => {
      (extractVideoId as ReturnType<typeof vi.fn>).mockReturnValue(null);

      const result = extractVideoMetadata();

      expect(result).toBeNull();
    });

    it("should extract metadata with all fields from primary selectors", () => {
      (extractVideoId as ReturnType<typeof vi.fn>).mockReturnValue("abc123");

      // Setup DOM with primary selectors
      document.body.innerHTML = `
        <ytd-watch-metadata>
          <h1>Test Video Title</h1>
        </ytd-watch-metadata>
        <ytd-channel-name>
          <div id="text"><a>Test Channel</a></div>
        </ytd-channel-name>
        <meta itemprop="datePublished" content="2024-01-15">
      `;

      const result = extractVideoMetadata();

      expect(result).toEqual({
        videoId: "abc123",
        title: "Test Video Title",
        channelName: "Test Channel",
        uploadDate: "2024-01-15",
      });
    });

    it("should fallback to secondary title selector", () => {
      (extractVideoId as ReturnType<typeof vi.fn>).mockReturnValue("xyz789");

      document.body.innerHTML = `
        <div id="title"><h1>Fallback Title</h1></div>
        <ytd-channel-name>
          <div id="text"><a>Channel Name</a></div>
        </ytd-channel-name>
        <meta itemprop="datePublished" content="2024-06-20">
      `;

      const result = extractVideoMetadata();

      expect(result?.title).toBe("Fallback Title");
    });

    it("should fallback to meta tag for title", () => {
      (extractVideoId as ReturnType<typeof vi.fn>).mockReturnValue("meta123");

      document.body.innerHTML = `
        <meta name="title" content="Meta Title">
        <ytd-channel-name>
          <div id="text"><a>Channel</a></div>
        </ytd-channel-name>
        <meta itemprop="datePublished" content="2024-03-10">
      `;

      const result = extractVideoMetadata();

      expect(result?.title).toBe("Meta Title");
    });

    it("should use 'Unknown Title' when no title found", () => {
      (extractVideoId as ReturnType<typeof vi.fn>).mockReturnValue("notitle");

      document.body.innerHTML = `
        <ytd-channel-name>
          <div id="text"><a>Channel</a></div>
        </ytd-channel-name>
        <meta itemprop="datePublished" content="2024-01-01">
      `;

      const result = extractVideoMetadata();

      expect(result?.title).toBe("Unknown Title");
    });

    it("should fallback to secondary channel name selector", () => {
      (extractVideoId as ReturnType<typeof vi.fn>).mockReturnValue("vid456");

      document.body.innerHTML = `
        <ytd-watch-metadata><h1>Video</h1></ytd-watch-metadata>
        <div id="upload-info">
          <div id="channel-name"><a>Fallback Channel</a></div>
        </div>
        <meta itemprop="datePublished" content="2024-02-28">
      `;

      const result = extractVideoMetadata();

      expect(result?.channelName).toBe("Fallback Channel");
    });

    it("should fallback to link itemprop for channel name", () => {
      (extractVideoId as ReturnType<typeof vi.fn>).mockReturnValue("link123");

      document.body.innerHTML = `
        <ytd-watch-metadata><h1>Video</h1></ytd-watch-metadata>
        <link itemprop="name" content="Linked Channel Name">
        <meta itemprop="datePublished" content="2024-04-15">
      `;

      const result = extractVideoMetadata();

      expect(result?.channelName).toBe("Linked Channel Name");
    });

    it("should use 'Unknown Channel' when no channel found", () => {
      (extractVideoId as ReturnType<typeof vi.fn>).mockReturnValue("nochannel");

      document.body.innerHTML = `
        <ytd-watch-metadata><h1>Video Title</h1></ytd-watch-metadata>
        <meta itemprop="datePublished" content="2024-01-01">
      `;

      const result = extractVideoMetadata();

      expect(result?.channelName).toBe("Unknown Channel");
    });

    it("should fallback to yt-formatted-string for upload date", () => {
      (extractVideoId as ReturnType<typeof vi.fn>).mockReturnValue("date456");

      document.body.innerHTML = `
        <ytd-watch-metadata><h1>Video</h1></ytd-watch-metadata>
        <ytd-channel-name><div id="text"><a>Channel</a></div></ytd-channel-name>
        <div id="info-strings">
          <yt-formatted-string>Jan 15, 2024</yt-formatted-string>
        </div>
      `;

      const result = extractVideoMetadata();

      expect(result?.uploadDate).toBe("Jan 15, 2024");
    });

    it("should use 'Unknown Date' when no date found", () => {
      (extractVideoId as ReturnType<typeof vi.fn>).mockReturnValue("nodate");

      document.body.innerHTML = `
        <ytd-watch-metadata><h1>Video Title</h1></ytd-watch-metadata>
        <ytd-channel-name><div id="text"><a>Channel</a></div></ytd-channel-name>
      `;

      const result = extractVideoMetadata();

      expect(result?.uploadDate).toBe("Unknown Date");
    });

    it("should trim whitespace from extracted text", () => {
      (extractVideoId as ReturnType<typeof vi.fn>).mockReturnValue("trim123");

      document.body.innerHTML = `
        <ytd-watch-metadata>
          <h1>   Padded Title   </h1>
        </ytd-watch-metadata>
        <ytd-channel-name>
          <div id="text"><a>  Padded Channel  </a></div>
        </ytd-channel-name>
        <meta itemprop="datePublished" content="2024-01-01">
      `;

      const result = extractVideoMetadata();

      expect(result?.title).toBe("Padded Title");
      expect(result?.channelName).toBe("Padded Channel");
    });

    it("should pass window.location.href to extractVideoId", () => {
      (extractVideoId as ReturnType<typeof vi.fn>).mockReturnValue("test123");

      Object.defineProperty(window, "location", {
        value: { href: "https://www.youtube.com/watch?v=customVideoId" },
        writable: true,
      });

      document.body.innerHTML = `
        <ytd-watch-metadata><h1>Title</h1></ytd-watch-metadata>
        <ytd-channel-name><div id="text"><a>Channel</a></div></ytd-channel-name>
        <meta itemprop="datePublished" content="2024-01-01">
      `;

      extractVideoMetadata();

      expect(extractVideoId).toHaveBeenCalledWith(
        "https://www.youtube.com/watch?v=customVideoId"
      );
    });

    it("should handle special characters in metadata", () => {
      (extractVideoId as ReturnType<typeof vi.fn>).mockReturnValue("special");

      document.body.innerHTML = `
        <ytd-watch-metadata>
          <h1>Video Title with &amp; and "quotes"</h1>
        </ytd-watch-metadata>
        <ytd-channel-name>
          <div id="text"><a>Channel's Name™</a></div>
        </ytd-channel-name>
        <meta itemprop="datePublished" content="2024-01-01">
      `;

      const result = extractVideoMetadata();

      expect(result?.title).toBe('Video Title with & and "quotes"');
      expect(result?.channelName).toBe("Channel's Name™");
    });

    it("should return all Unknown defaults when no DOM elements exist", () => {
      (extractVideoId as ReturnType<typeof vi.fn>).mockReturnValue("empty");

      document.body.innerHTML = "";

      const result = extractVideoMetadata();

      expect(result).toEqual({
        videoId: "empty",
        title: "Unknown Title",
        channelName: "Unknown Channel",
        uploadDate: "Unknown Date",
      });
    });
  });
});
