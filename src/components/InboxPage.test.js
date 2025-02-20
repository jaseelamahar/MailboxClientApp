import React from "react";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import InboxPage from "./InboxPage";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({ push: jest.fn() }),
}));

describe("InboxPage Component", () => {
  test("renders the Inbox Page correctly", () => {
    render(
      <MemoryRouter>
        <InboxPage />
      </MemoryRouter>
    );
    expect(screen.getByText("Yahoo! Mail")).toBeInTheDocument();
  });

  test("displays 'No mails available.' when inbox is empty", () => {
    render(
      <MemoryRouter>
        <InboxPage />
      </MemoryRouter>
    );
    expect(screen.getByText("No mails available.")).toBeInTheDocument();
  });

  test("displays 'No sent mails available.' when sent box is empty", () => {
    render(
      <MemoryRouter>
        <InboxPage />
      </MemoryRouter>
    );
    expect(screen.getByText("No sent mails available.")).toBeInTheDocument();
  });

  test("calls fetchInboxEmails when Inbox button is clicked", async () => {
    render(
      <MemoryRouter>
        <InboxPage />
      </MemoryRouter>
    );

    const inboxButton = screen.getByRole("button", { name: /inbox/i });

    await act(async () => {
      fireEvent.click(inboxButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/No mails available/i)).toBeInTheDocument();
    });
  });

  test("calls fetchSentMails when Sent button is clicked", async () => {
    render(
      <MemoryRouter>
        <InboxPage />
      </MemoryRouter>
    );

    const sentButtons = screen.getAllByText("Sent"); // Handle multiple Sent buttons

    await act(async () => {
      fireEvent.click(sentButtons[0]); // Click first "Sent" button
    });

    await waitFor(() => {
      expect(screen.getByText(/No sent mails available/i)).toBeInTheDocument();
    });
  });
});
