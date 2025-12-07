import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { fetchDefinition } from './politicalTermService';
import { supabase } from './supabase';

// Mock Supabase
vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('politicalTermService', () => {
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

    // Setup global fetch mock
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('fetchDefinition', () => {
    it('should return cached definition if found in Supabase', async () => {
      const mockData = {
        Keyword: 'Socialism',
        Definition: 'A political and economic theory...',
        Link: 'http://example.com',
      };

      maybeSingleMock.mockResolvedValue({ data: mockData, error: null });

      const result = await fetchDefinition('Socialism');

      expect(supabase.from).toHaveBeenCalledWith('political_terms');
      expect(selectMock).toHaveBeenCalledWith('Keyword, Definition, Link');
      expect(ilikeMock).toHaveBeenCalledWith('Keyword', 'Socialism');
      expect(maybeSingleMock).toHaveBeenCalled();
      expect(global.fetch).not.toHaveBeenCalled();
      expect(result).toEqual({
        Term: 'Socialism',
        Definition: 'A political and economic theory...',
        Link: 'http://example.com',
      });
    });

    it('should fetch from API and cache if not found in Supabase', async () => {
      // Supabase returns null (not found)
      maybeSingleMock.mockResolvedValue({ data: null, error: null });

      // API returns definition
      const apiResponse = {
        Term: 'Socialism',
        Definition: 'API Definition',
        Link: 'http://api.com',
      };
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => apiResponse,
      });

      // Upsert mock
      upsertMock.mockResolvedValue({ error: null });

      const result = await fetchDefinition('Socialism');

      // Check Supabase lookup
      expect(supabase.from).toHaveBeenCalledWith('political_terms');
      
      // Check API call
      expect(global.fetch).toHaveBeenCalledWith('/api/python/definition/Socialism');

      // Check Caching
      expect(upsertMock).toHaveBeenCalledWith(
        {
          Keyword: 'Socialism',
          Definition: 'API Definition',
          Link: 'http://api.com',
        },
        {
          onConflict: 'Keyword',
          ignoreDuplicates: false,
        }
      );

      expect(result).toEqual(apiResponse);
    });

    it('should throw error if API fetch fails', async () => {
      maybeSingleMock.mockResolvedValue({ data: null, error: null });
      (global.fetch as Mock).mockResolvedValue({
        ok: false,
      });

      await expect(fetchDefinition('Socialism')).rejects.toThrow('Failed to fetch definition');
    });

    it('should throw error if API returns invalid shape', async () => {
      maybeSingleMock.mockResolvedValue({ data: null, error: null });
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ invalid: 'shape' }),
      });

      await expect(fetchDefinition('Socialism')).rejects.toThrow('Unexpected response shape');
    });

    it('should handle Supabase error gracefully and try API', async () => {
      // Supabase returns error
      maybeSingleMock.mockResolvedValue({ data: null, error: { message: 'DB Error' } });

      const apiResponse = {
        Term: 'Socialism',
        Definition: 'API Definition',
        Link: 'http://api.com',
      };
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => apiResponse,
      });
      upsertMock.mockResolvedValue({ error: null });

      const result = await fetchDefinition('Socialism');

      expect(global.fetch).toHaveBeenCalled();
      expect(result).toEqual(apiResponse);
    });
  });
});
