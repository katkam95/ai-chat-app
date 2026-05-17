import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { fetchAIResponse } from "./api";

jest.mock("./api");

describe("App", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("loads chat UI", () => {
    render(<App />);
    expect(screen.getByText(/Hello! I'm your AI assistant/i)).toBeInTheDocument();
  });

  test("can type and send message", async () => {
    fetchAIResponse.mockResolvedValueOnce("Hi there!");

    render(<App />);

    const input = screen.getByPlaceholderText(/Type a message/i);
    const button = screen.getByRole("button", { name: /send message/i });

    await userEvent.type(input, "Hello");
    fireEvent.click(button);

    expect(screen.getByText("Hello")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Hi there!")).toBeInTheDocument();
    });
  });

  test("clears input after send", async () => {
    fetchAIResponse.mockResolvedValueOnce("ok");

    render(<App />);

    const input = screen.getByPlaceholderText(/Type a message/i);

    await userEvent.type(input, "test");
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(input.value).toBe("");
    });
  });

  test("handles error from API", async () => {
    fetchAIResponse.mockRejectedValueOnce(new Error("failed"));

    render(<App />);

    const input = screen.getByPlaceholderText(/Type a message/i);

    await userEvent.type(input, "error test");
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    });
  });
});