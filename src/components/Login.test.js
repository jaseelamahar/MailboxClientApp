import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "./auth-context";
import Login from "./Login";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({
    push: jest.fn(),
  }),
}));

describe("Login Component", () => {
  test("renders login form with email and password fields", () => {
    render(
      <AuthContext.Provider value={{ login: jest.fn() }}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthContext.Provider>
    );
    expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter password")).toBeInTheDocument();
  });

  test("login button is present and clickable", () => {
    render(
      <AuthContext.Provider value={{ login: jest.fn() }}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    const loginBtn = screen.getByRole("button", { name: /login/i });
    expect(loginBtn).toBeInTheDocument();
    fireEvent.click(loginBtn);
  });
});
test("email input should be empty initially", () => {
    render(
      <AuthContext.Provider value={{ login: jest.fn() }}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthContext.Provider>
    );
  
    const emailInput = screen.getByPlaceholderText("Enter email");
    expect(emailInput.value).toBe("");
  });
  
  test('renders "Forgot password" link', () => {
    render(
      <AuthContext.Provider value={{ login: jest.fn() }}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthContext.Provider>
    );
  
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });
  
   