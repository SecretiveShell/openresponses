import { describe, it, expect } from "bun:test";
import { parseInlineMarkdown } from "./markdown";

describe("parseInlineMarkdown", () => {
  /**
   * No-op / base cases
   */
  describe("no-op cases", () => {
    it("returns an empty string as-is", () => {
      expect(parseInlineMarkdown("")).toBe("");
    });

    it("returns the input string if no markdown syntax is present", () => {
      expect(parseInlineMarkdown("Hello world")).toBe("Hello world");
    });

    it("does not transform incomplete markdown syntax", () => {
      expect(parseInlineMarkdown("**bold")).toBe("**bold");
      expect(parseInlineMarkdown("[link]()")).toBe("[link]()");
      expect(parseInlineMarkdown("`code")).toBe("`code");
    });
  });

  /**
   * Single syntax conversions
   */
  describe("converts supported inline markdown correctly", () => {
    it("converts **bold** to <strong>", () => {
      const result = parseInlineMarkdown("**bold text**");
      expect(result).toBe('<strong class="font-bold">bold text</strong>');
    });

    it("converts [text](url) to <a>", () => {
      const result = parseInlineMarkdown("[Example](https://example.com)");
      expect(result).toBe(
        '<a href="https://example.com" class="text-blue-600 hover:text-blue-800 underline">Example</a>',
      );
    });

    it("converts `code` to <code>", () => {
      const result = parseInlineMarkdown("`someCode`");
      expect(result).toBe(
        '<code class="px-1.5 py-0.5 bg-slate-100 text-slate-900 rounded text-sm font-mono border border-slate-200">someCode</code>',
      );
    });
  });

  /**
   * Compound cases
   */
  describe("compound cases", () => {
    it("handles multiple different inline syntaxes in the same string", () => {
      const input =
        "This is **bold** and this is `code` with a [link](https://example.com).";
      const result = parseInlineMarkdown(input);

      expect(result).toContain('<strong class="font-bold">bold</strong>');
      expect(result).toContain(
        '<code class="px-1.5 py-0.5 bg-slate-100 text-slate-900 rounded text-sm font-mono border border-slate-200">code</code>',
      );
      expect(result).toContain(
        '<a href="https://example.com" class="text-blue-600 hover:text-blue-800 underline">link</a>',
      );
    });

    it("handles multiple occurrences of the same syntax", () => {
      const input = "**first bold** and **second bold**";
      const result = parseInlineMarkdown(input);

      expect(result).toBe(
        '<strong class="font-bold">first bold</strong> and <strong class="font-bold">second bold</strong>',
      );
    });
  });

  /**
   * Known limitations
   */
  describe("known limitations (by design)", () => {
    it("does not reliably support nested inline syntax", () => {
      const input = "**bold with `code`**";
      const result = parseInlineMarkdown(input);

      // Nested syntax is not supported; behavior is implementation-defined.
      expect(result).toContain('<strong class="font-bold">');
    });

    it("does not support backticks inside inline code", () => {
      const input = "`code with ` inside`";
      const result = parseInlineMarkdown(input);

      // The regex stops at the first closing backtick.
      expect(result).toBe(
        '<code class="px-1.5 py-0.5 bg-slate-100 text-slate-900 rounded text-sm font-mono border border-slate-200">code with </code> inside`',
      );
    });

    it("does not support parentheses in link URLs", () => {
      const input = "[link](https://example.com/path(with)paren)";
      const result = parseInlineMarkdown(input);

      // The regex terminates the URL at the first closing parenthesis.
      expect(result).toBe(
        '<a href="https://example.com/path(with" class="text-blue-600 hover:text-blue-800 underline">link</a>paren)',
      );
    });

    it("allows raw HTML as-is (trusted input assumption)", () => {
      const input = "<span>raw</span>";
      expect(parseInlineMarkdown(input)).toBe(input);
    });
  });
});
