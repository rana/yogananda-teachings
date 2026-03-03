/**
 * Tests for ContinueReading — homepage returning seeker invitation.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      continueReading: "Continue where you left off",
    };
    return translations[key] || key;
  },
}));

// Mock reading-journey
const mockGetLastRead = vi.fn();
vi.mock("@/lib/reading-journey", () => ({
  getLastRead: () => mockGetLastRead(),
}));

import { ContinueReading } from "../ContinueReading";

describe("ContinueReading", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing for first-time visitors", () => {
    mockGetLastRead.mockReturnValue(null);
    const { container } = render(<ContinueReading locale="en" />);
    expect(container.innerHTML).toBe("");
  });

  it("renders continuation link for returning seekers", () => {
    mockGetLastRead.mockReturnValue({
      bookSlug: "autobiography-of-a-yogi",
      bookTitle: "Autobiography of a Yogi",
      bookAuthor: "Paramahansa Yogananda",
      chapterNumber: 14,
      chapterTitle: "An Experience in Cosmic Consciousness",
      timestamp: Date.now(),
    });
    render(<ContinueReading locale="en" />);
    expect(screen.getByText("Continue where you left off")).toBeInTheDocument();
    expect(screen.getByText("An Experience in Cosmic Consciousness")).toBeInTheDocument();
    expect(screen.getByText("Autobiography of a Yogi")).toBeInTheDocument();
  });

  it("links to the correct chapter with locale", () => {
    mockGetLastRead.mockReturnValue({
      bookSlug: "autobiografia-de-un-yogui",
      bookTitle: "Autobiografía de un yogui",
      bookAuthor: "Paramahansa Yogananda",
      chapterNumber: 7,
      chapterTitle: "El Swami que levita",
      timestamp: Date.now(),
    });
    render(<ContinueReading locale="es" />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe(
      "/es/books/autobiografia-de-un-yogui/7",
    );
  });

  it("shows chapter number prefix", () => {
    mockGetLastRead.mockReturnValue({
      bookSlug: "auto",
      bookTitle: "Auto",
      bookAuthor: "Author",
      chapterNumber: 33,
      chapterTitle: "Babaji",
      timestamp: Date.now(),
    });
    render(<ContinueReading locale="en" />);
    expect(screen.getByText(/Ch\. 33:/)).toBeInTheDocument();
  });
});
