import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import { analyzeTranscript } from "./analyzeTranscript";
import { supabase } from "@/lib/supabase";

// Mock Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe("analyzeTranscript", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("analyzeTranscript", () => {
    const mockSession = {
      access_token: "mock-access-token-12345",
      user: { id: "user-123", email: "test@example.com" },
    };

    const mockAnalysisResponse = {
      political_leaning: "center",
      political_philosophies: ["liberalism", "conservatism"],
      summary_and_analysis: "This is a balanced analysis...",
    };

    const mockVideoMetadata = {
      videoId: "abc123",
      title: "Test Video",
      channelName: "Test Channel",
      uploadDate: "2024-01-15",
    };

    it("should return analysis data when session exists and function succeeds", async () => {
      // Setup mocks
      (supabase.auth.getSession as Mock).mockResolvedValue({
        data: { session: mockSession },
      });
      (supabase.functions.invoke as Mock).mockResolvedValue({
        data: mockAnalysisResponse,
        error: null,
      });

      const result = await analyzeTranscript("Sample transcript text", mockVideoMetadata);

      // Verify getSession was called
      expect(supabase.auth.getSession).toHaveBeenCalled();

      // Verify function was invoked with correct parameters
      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        "analyze-transcript-gemini",
        {
          body: { transcript: "Sample transcript text", videoMetadata: mockVideoMetadata },
          headers: {
            Authorization: `Bearer ${mockSession.access_token}`,
          },
        }
      );

      // Verify result
      expect(result).toEqual(mockAnalysisResponse);
    });

    it("should throw error when no active session exists", async () => {
      // Setup mock - no session
      (supabase.auth.getSession as Mock).mockResolvedValue({
        data: { session: null },
      });

      await expect(analyzeTranscript("Sample transcript", mockVideoMetadata)).rejects.toThrow(
        "No active session. Please log in via the extension popup."
      );

      // Verify function was NOT invoked
      expect(supabase.functions.invoke).not.toHaveBeenCalled();
    });

    it("should throw error when Supabase function returns an error", async () => {
      // Setup mocks
      (supabase.auth.getSession as Mock).mockResolvedValue({
        data: { session: mockSession },
      });
      (supabase.functions.invoke as Mock).mockResolvedValue({
        data: null,
        error: { message: "Internal server error" },
      });

      await expect(analyzeTranscript("Sample transcript", mockVideoMetadata)).rejects.toThrow(
        "Supabase function error: Internal server error"
      );
    });

    it("should throw error when Supabase function returns error without message", async () => {
      // Setup mocks
      (supabase.auth.getSession as Mock).mockResolvedValue({
        data: { session: mockSession },
      });
      (supabase.functions.invoke as Mock).mockResolvedValue({
        data: null,
        error: { code: "UNKNOWN_ERROR" },
      });

      await expect(analyzeTranscript("Sample transcript", mockVideoMetadata)).rejects.toThrow(
        'Supabase function error: {"code":"UNKNOWN_ERROR"}'
      );
    });

    it("should throw error when Supabase function returns no data", async () => {
      // Setup mocks
      (supabase.auth.getSession as Mock).mockResolvedValue({
        data: { session: mockSession },
      });
      (supabase.functions.invoke as Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(analyzeTranscript("Sample transcript", mockVideoMetadata)).rejects.toThrow(
        "Supabase function returned no data"
      );
    });

    it("should include authorization header with session token", async () => {
      const customToken = "custom-jwt-token-xyz";
      (supabase.auth.getSession as Mock).mockResolvedValue({
        data: { session: { ...mockSession, access_token: customToken } },
      });
      (supabase.functions.invoke as Mock).mockResolvedValue({
        data: mockAnalysisResponse,
        error: null,
      });

      await analyzeTranscript("Test transcript", mockVideoMetadata);

      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            Authorization: `Bearer ${customToken}`,
          },
        })
      );
    });

    it("should pass transcript in the request body", async () => {
      const longTranscript = "A very long transcript ".repeat(100);

      (supabase.auth.getSession as Mock).mockResolvedValue({
        data: { session: mockSession },
      });
      (supabase.functions.invoke as Mock).mockResolvedValue({
        data: mockAnalysisResponse,
        error: null,
      });

      await analyzeTranscript(longTranscript, mockVideoMetadata);

      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        "analyze-transcript-gemini",
        expect.objectContaining({
          body: { transcript: longTranscript, videoMetadata: mockVideoMetadata },
        })
      );
    });
  });
});
