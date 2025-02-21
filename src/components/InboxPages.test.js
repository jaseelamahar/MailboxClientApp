import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import inboxReducer, { setEmails, markAsRead } from "./inboxSlice"; // Import reducer & actions
import InboxPage from "./InboxPage";

const setupStore = (preloadedState) => {
  return configureStore({
    reducer: { inbox: inboxReducer },
    preloadedState,
  });
};

describe("InboxPage Tests", () => {
  let store;

  beforeEach(() => {
    store = setupStore({
      inbox: {
        emails: [],
        unreadCount: 0,
      },
    });
  });

  test("shows 'No mails available' when inbox is empty", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <InboxPage />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("No mails available.")).toBeInTheDocument();
  });

  test("displays blue dot for unread emails", () => {
    store.dispatch(
      setEmails([{ id: "1", from: "user@example.com", subject: "Hello", body: "Test", read: false }])
    );

    render(
      <Provider store={store}>
        <MemoryRouter>
          <InboxPage />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("🔵")).toBeInTheDocument();
  });

  test("removes blue dot when email is clicked (marked as read)", async () => {
    store.dispatch(
      setEmails([{ id: "1", from: "user@example.com", subject: "Hello", body: "Test", read: false }])
    );

    // Mock fetch calls
    global.fetch = jest.fn((url, options) => {
      if (options && options.method === "PATCH") {
        return Promise.resolve({ json: () => Promise.resolve({}) }); // Simulate marking as read
      }
      return Promise.resolve({
        json: () =>
          Promise.resolve({
            "1": {
              inbox: {
                "1": { id: "1", from: "user@example.com", subject: "Hello", body: "Test", read: true }, // Simulate updated state
              },
            },
          }),
      });
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <InboxPage />
        </MemoryRouter>
      </Provider>
    );

    const emailItem = screen.getByText("Hello");
    fireEvent.click(emailItem);

    await waitFor(() => {
      expect(screen.queryByText("🔵")).not.toBeInTheDocument();
    });

    global.fetch.mockRestore();
  });
});
