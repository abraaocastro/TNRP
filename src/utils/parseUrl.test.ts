import { describe, it, expect } from "vitest";
import { parseStreamUrl } from "./parseUrl";

describe("parseStreamUrl", () => {
  // --- YouTube ---
  describe("YouTube", () => {
    it("extrai ID de youtube.com/watch?v=", () => {
      const result = parseStreamUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
      expect(result).toEqual({ platform: "youtube", embedId: "dQw4w9WgXcQ" });
    });

    it("extrai ID de youtube.com/watch?v= com params extras", () => {
      const result = parseStreamUrl("https://youtube.com/watch?v=abc123&t=120");
      expect(result).toEqual({ platform: "youtube", embedId: "abc123" });
    });

    it("extrai ID de youtu.be/", () => {
      const result = parseStreamUrl("https://youtu.be/dQw4w9WgXcQ");
      expect(result).toEqual({ platform: "youtube", embedId: "dQw4w9WgXcQ" });
    });

    it("extrai ID de youtube.com/live/", () => {
      const result = parseStreamUrl("https://www.youtube.com/live/abc123");
      expect(result).toEqual({ platform: "youtube", embedId: "abc123" });
    });

    it("extrai ID de youtube.com/embed/", () => {
      const result = parseStreamUrl("https://youtube.com/embed/xyz789");
      expect(result).toEqual({ platform: "youtube", embedId: "xyz789" });
    });

    it("extrai ID de m.youtube.com", () => {
      const result = parseStreamUrl("https://m.youtube.com/watch?v=mobile123");
      expect(result).toEqual({ platform: "youtube", embedId: "mobile123" });
    });

    it("retorna null para youtube.com sem video ID", () => {
      expect(parseStreamUrl("https://youtube.com/")).toBeNull();
      expect(parseStreamUrl("https://youtube.com/feed")).toBeNull();
    });
  });

  // --- Twitch ---
  describe("Twitch", () => {
    it("extrai canal de twitch.tv/CHANNEL", () => {
      const result = parseStreamUrl("https://www.twitch.tv/cazetv");
      expect(result).toEqual({ platform: "twitch", embedId: "cazetv" });
    });

    it("extrai VOD de twitch.tv/videos/ID", () => {
      const result = parseStreamUrl("https://twitch.tv/videos/123456789");
      expect(result).toEqual({ platform: "twitch", embedId: "video:123456789" });
    });

    it("extrai canal de m.twitch.tv", () => {
      const result = parseStreamUrl("https://m.twitch.tv/gaules");
      expect(result).toEqual({ platform: "twitch", embedId: "gaules" });
    });

    it("ignora páginas internas do Twitch", () => {
      expect(parseStreamUrl("https://twitch.tv/directory")).toBeNull();
      expect(parseStreamUrl("https://twitch.tv/settings")).toBeNull();
      expect(parseStreamUrl("https://twitch.tv/downloads")).toBeNull();
    });
  });

  // --- Kick ---
  describe("Kick", () => {
    it("extrai canal de kick.com/CHANNEL", () => {
      const result = parseStreamUrl("https://kick.com/xqc");
      expect(result).toEqual({ platform: "kick", embedId: "xqc" });
    });

    it("extrai VOD de kick.com/video/UUID", () => {
      const result = parseStreamUrl("https://kick.com/video/abc-123-def");
      expect(result).toEqual({ platform: "kick", embedId: "video:abc-123-def" });
    });

    it("ignora páginas internas do Kick", () => {
      expect(parseStreamUrl("https://kick.com/categories")).toBeNull();
      expect(parseStreamUrl("https://kick.com/following")).toBeNull();
      expect(parseStreamUrl("https://kick.com/search")).toBeNull();
    });
  });

  // --- Inválidos ---
  describe("URLs inválidas", () => {
    it("retorna null para texto aleatório", () => {
      expect(parseStreamUrl("not a url")).toBeNull();
    });

    it("retorna null para URL de outro site", () => {
      expect(parseStreamUrl("https://google.com")).toBeNull();
    });

    it("retorna null para string vazia", () => {
      expect(parseStreamUrl("")).toBeNull();
    });

    it("trata espaços em branco", () => {
      const result = parseStreamUrl("  https://youtu.be/test123  ");
      expect(result).toEqual({ platform: "youtube", embedId: "test123" });
    });
  });
});
