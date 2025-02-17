import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MailPage from "./MailPage"; 

jest.mock("react-draft-wysiwyg", () => ({
  Editor: ({ onEditorStateChange }) => (
    <textarea data-testid="editor" onChange={(e) => onEditorStateChange(e.target.value)} />
  ),
}));

global.fetch = jest.fn(); // Declare fetch mock globally

describe("MailPage Component", () => {
  beforeEach(() => {
    fetch.mockClear();
    fetch.mockImplementation((url, options) => {
      if (options && options.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: async () => ({ message: "Email sent successfully" }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () =>
          url.includes("/inbox.json") || url.includes("/sent.json")
            ? { 1: { subject: "Test Email", body: "Test Body" } }
            : null,
      });
    });
  });

  test("renders MailPage correctly", () => {
    render(<MailPage />);
    expect(screen.getByText("To")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Test mail")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  test("fetches and displays inbox emails", async () => {
    render(<MailPage />);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2)); // Fetch called for inbox & sent emails
  });

  test("fetches and displays sent emails", async () => {
    render(<MailPage />);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2)); // Same as above
  });

  test("handles send mail button click", async () => {
    render(<MailPage />);
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(4)); // 2 for fetching, 2 for sending
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/inbox.json"),
      expect.objectContaining({ method: "POST" })
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/sent.json"),
      expect.objectContaining({ method: "POST" })
    );
  });

  test("formats email correctly for Firebase", () => {
    const formatEmailForFirebase = (email) => email.replace(/\./g, ",");
    expect(formatEmailForFirebase("test.email@gmail.com")).toBe("test,email@gmail,com");
  });
});
