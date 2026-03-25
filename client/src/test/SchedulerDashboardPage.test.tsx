import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { SchedulerDashboardPage } from "../pages/SchedulerDashboardPage";

describe("SchedulerDashboardPage", () => {
  it("renders the main dashboard heading", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false
        }
      }
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <SchedulerDashboardPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText("Map Scheduler MVP")).toBeInTheDocument();
    expect(screen.getByText("Place manager")).toBeInTheDocument();
  });
});
