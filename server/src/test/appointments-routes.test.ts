import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../lib/prisma.js";
import { createApp } from "../app.js";

const { app } = createApp();

async function resetSchedulerData() {
  await prisma.waypoint.deleteMany();
  await prisma.savedRoute.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.place.deleteMany();
  await prisma.user.deleteMany();
}

async function seedBaseData() {
  await prisma.user.create({
    data: {
      id: "test-user",
      email: "test@example.com",
      passwordHash: "test-password-hash",
      name: "Test User"
    }
  });

  await prisma.place.createMany({
    data: [
      {
        id: "origin-place",
        userId: "test-user",
        name: "Origin",
        lat: 37.5,
        lng: 127.0
      },
      {
        id: "destination-place",
        userId: "test-user",
        name: "Destination",
        lat: 37.6,
        lng: 127.1
      }
    ]
  });
}

describe("appointment routes api", () => {
  beforeEach(async () => {
    await resetSchedulerData();
    await seedBaseData();
  });

  afterAll(async () => {
    await resetSchedulerData();
    await prisma.$disconnect();
  });

  it("returns 400 when creating a route for an appointment without origin place", async () => {
    await prisma.appointment.create({
      data: {
        id: "appointment-no-origin",
        userId: "test-user",
        title: "No origin appointment",
        startAt: new Date("2026-03-26T01:00:00.000Z"),
        transportMode: "TRANSIT",
        destinationPlaceId: "destination-place"
      }
    });

    const response = await request(app).post("/api/appointments/appointment-no-origin/routes").send({
      summary: "Should fail",
      distanceMeters: 1200,
      durationSeconds: 900
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Appointment must have an origin place before adding routes");
  });

  it("returns 404 when selecting a route that belongs to another appointment", async () => {
    await prisma.appointment.createMany({
      data: [
        {
          id: "appointment-a",
          userId: "test-user",
          title: "Appointment A",
          startAt: new Date("2026-03-26T01:00:00.000Z"),
          transportMode: "TRANSIT",
          originPlaceId: "origin-place",
          destinationPlaceId: "destination-place"
        },
        {
          id: "appointment-b",
          userId: "test-user",
          title: "Appointment B",
          startAt: new Date("2026-03-26T02:00:00.000Z"),
          transportMode: "TRANSIT",
          originPlaceId: "origin-place",
          destinationPlaceId: "destination-place"
        }
      ]
    });

    await prisma.savedRoute.create({
      data: {
        id: "route-b",
        appointmentId: "appointment-b",
        originPlaceId: "origin-place",
        destinationPlaceId: "destination-place",
        distanceMeters: 1500,
        durationSeconds: 1000
      }
    });

    const response = await request(app).patch("/api/appointments/appointment-a/routes/route-b/select").send();

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Route not found");
  });

  it("returns 404 when updating a route that belongs to another appointment", async () => {
    await prisma.appointment.createMany({
      data: [
        {
          id: "appointment-a",
          userId: "test-user",
          title: "Appointment A",
          startAt: new Date("2026-03-26T01:00:00.000Z"),
          transportMode: "TRANSIT",
          originPlaceId: "origin-place",
          destinationPlaceId: "destination-place"
        },
        {
          id: "appointment-b",
          userId: "test-user",
          title: "Appointment B",
          startAt: new Date("2026-03-26T02:00:00.000Z"),
          transportMode: "TRANSIT",
          originPlaceId: "origin-place",
          destinationPlaceId: "destination-place"
        }
      ]
    });

    await prisma.savedRoute.create({
      data: {
        id: "route-b",
        appointmentId: "appointment-b",
        originPlaceId: "origin-place",
        destinationPlaceId: "destination-place",
        distanceMeters: 1500,
        durationSeconds: 1000
      }
    });

    const response = await request(app).patch("/api/appointments/appointment-a/routes/route-b").send({
      summary: "Updated summary"
    });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Route not found");
  });

  it("promotes a fallback selected route when deleting the selected route", async () => {
    await prisma.appointment.create({
      data: {
        id: "appointment-a",
        userId: "test-user",
        title: "Appointment A",
        startAt: new Date("2026-03-26T01:00:00.000Z"),
        transportMode: "TRANSIT",
        originPlaceId: "origin-place",
        destinationPlaceId: "destination-place"
      }
    });

    await prisma.savedRoute.createMany({
      data: [
        {
          id: "route-selected",
          appointmentId: "appointment-a",
          originPlaceId: "origin-place",
          destinationPlaceId: "destination-place",
          distanceMeters: 1000,
          durationSeconds: 700,
          selectedOption: true
        },
        {
          id: "route-fallback",
          appointmentId: "appointment-a",
          originPlaceId: "origin-place",
          destinationPlaceId: "destination-place",
          distanceMeters: 1400,
          durationSeconds: 900,
          selectedOption: false
        }
      ]
    });

    const response = await request(app).delete("/api/appointments/appointment-a/routes/route-selected").send();

    expect(response.status).toBe(200);
    expect(response.body.routes).toHaveLength(1);
    expect(response.body.routes[0].id).toBe("route-fallback");
    expect(response.body.routes[0].selectedOption).toBe(true);
  });
});
