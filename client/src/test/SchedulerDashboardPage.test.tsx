import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { SchedulerDashboardPage } from "../pages/SchedulerDashboardPage";
import { server } from "./server";

function renderDashboard() {
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
}

describe("SchedulerDashboardPage", () => {
  it("renders the main dashboard heading", async () => {
    renderDashboard();

    expect(await screen.findByText("Map Scheduler MVP")).toBeInTheDocument();
    expect(screen.getByText("Place manager")).toBeInTheDocument();
  });

  it("shows a page error banner when appointments fail to load", async () => {
    server.use(
      http.get("http://127.0.0.1:4000/api/appointments", () =>
        HttpResponse.json({ message: "Appointments failed to load" }, { status: 500 })
      )
    );

    renderDashboard();

    expect(await screen.findByText("Appointments load failed: Appointments failed to load")).toBeInTheDocument();
  });

  it("shows a route form error when route creation fails", async () => {
    server.use(
      http.post("http://127.0.0.1:4000/api/appointments/:id/routes", () =>
        HttpResponse.json({ message: "Route creation failed" }, { status: 400 })
      )
    );

    const user = userEvent.setup();
    renderDashboard();

    await user.click(await screen.findByRole("button", { name: /Initial appointment sample/i }));
    await user.type(screen.getByLabelText("Distance meters"), "1200");
    await user.type(screen.getByLabelText("Duration seconds"), "900");
    await user.click(screen.getByRole("button", { name: "Add route candidate" }));

    expect(await screen.findByText("Route creation failed")).toBeInTheDocument();
  });

  it("shows a field error next to the route input when the route API returns validation details", async () => {
    server.use(
      http.post("http://127.0.0.1:4000/api/appointments/:id/routes", () =>
        HttpResponse.json(
          {
            message: "Validation failed",
            details: {
              fieldErrors: {
                distanceMeters: ["distanceMeters must be greater than 0"]
              },
              formErrors: []
            }
          },
          { status: 400 }
        )
      )
    );

    const user = userEvent.setup();
    renderDashboard();

    await user.click(await screen.findByRole("button", { name: /Initial appointment sample/i }));
    await user.type(screen.getByLabelText("Distance meters"), "1200");
    await user.type(screen.getByLabelText("Duration seconds"), "900");
    await user.click(screen.getByRole("button", { name: "Add route candidate" }));

    expect(await screen.findByText("distanceMeters must be greater than 0")).toBeInTheDocument();
  });

  it("shows route action errors inside the route section", async () => {
    server.use(
      http.patch("http://127.0.0.1:4000/api/appointments/:id/routes/:routeId/select", () =>
        HttpResponse.json({ message: "Route selection failed" }, { status: 400 })
      )
    );

    const user = userEvent.setup();
    renderDashboard();

    await user.click(await screen.findByRole("button", { name: /Initial appointment sample/i }));
    await user.click(screen.getByRole("button", { name: "Select" }));

    expect(await screen.findByText("Route selection failed")).toBeInTheDocument();
  });
});
