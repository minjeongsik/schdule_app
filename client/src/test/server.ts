import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { Appointment, Place } from "../types/scheduler";

const defaultPlaces = (): Place[] => [
  {
    id: "home-place",
    userId: "demo-user",
    name: "Home",
    roadAddress: "1 Teheran-ro, Gangnam-gu, Seoul",
    jibunAddress: null,
    lat: 37.498095,
    lng: 127.02761,
    createdAt: "2026-03-24T00:00:00.000Z",
    updatedAt: "2026-03-24T00:00:00.000Z"
  },
  {
    id: "office-place",
    userId: "demo-user",
    name: "Office",
    roadAddress: "110 Sejong-daero, Jung-gu, Seoul",
    jibunAddress: null,
    lat: 37.5662952,
    lng: 126.9779451,
    createdAt: "2026-03-24T00:00:00.000Z",
    updatedAt: "2026-03-24T00:00:00.000Z"
  }
];

const places: Place[] = defaultPlaces();

const initialAppointments = (): Appointment[] => [
  {
    id: "demo-appointment",
    userId: "demo-user",
    title: "Initial appointment sample",
    memo: "Sample data for appointments CRUD",
    startAt: "2026-03-25T01:00:00.000Z",
    endAt: "2026-03-25T02:00:00.000Z",
    transportMode: "TRANSIT",
    status: "SCHEDULED",
    originPlaceId: "home-place",
    destinationPlaceId: "office-place",
    createdAt: "2026-03-24T00:00:00.000Z",
    updatedAt: "2026-03-24T00:00:00.000Z",
    originPlace: places[0],
    destinationPlace: places[1]
  }
];

const appointments: Appointment[] = initialAppointments();

export const handlers = [
  http.get("http://127.0.0.1:4000/api/appointments", () => HttpResponse.json(appointments)),
  http.post("http://127.0.0.1:4000/api/appointments", async ({ request }) => {
    const body = (await request.json()) as Record<string, string>;
    const originPlace = places.find((place) => place.id === body.originPlaceId) ?? null;
    const destinationPlace = places.find((place) => place.id === body.destinationPlaceId) ?? places[0];
    const nextAppointment: Appointment = {
      id: `appointment-${appointments.length + 1}`,
      userId: body.userId,
      title: body.title,
      memo: body.memo ?? null,
      startAt: body.startAt,
      endAt: body.endAt ?? null,
      transportMode: body.transportMode as Appointment["transportMode"],
      status: "SCHEDULED",
      originPlaceId: body.originPlaceId ?? null,
      destinationPlaceId: body.destinationPlaceId,
      createdAt: "2026-03-24T00:00:00.000Z",
      updatedAt: "2026-03-24T00:00:00.000Z",
      originPlace,
      destinationPlace
    };

    appointments.unshift(nextAppointment);
    return HttpResponse.json(nextAppointment, { status: 201 });
  }),
  http.patch("http://127.0.0.1:4000/api/appointments/:id", async ({ params, request }) => {
    const body = (await request.json()) as Record<string, string | null>;
    const appointment = appointments.find((item) => item.id === params.id);
    if (!appointment) {
      return HttpResponse.json({ message: "Appointment not found" }, { status: 404 });
    }

    const destinationPlace = body.destinationPlaceId
      ? places.find((place) => place.id === body.destinationPlaceId) ?? appointment.destinationPlace
      : appointment.destinationPlace;
    const originPlace =
      body.originPlaceId === null
        ? null
        : body.originPlaceId
          ? places.find((place) => place.id === body.originPlaceId) ?? appointment.originPlace
          : appointment.originPlace;

    Object.assign(appointment, body, {
      originPlace,
      destinationPlace,
      updatedAt: "2026-03-24T00:00:00.000Z"
    });
    return HttpResponse.json(appointment);
  }),
  http.delete("http://127.0.0.1:4000/api/appointments/:id", ({ params }) => {
    const index = appointments.findIndex((item) => item.id === params.id);
    if (index >= 0) {
      appointments.splice(index, 1);
    }

    return new HttpResponse(null, { status: 204 });
  }),
  http.get("http://127.0.0.1:4000/api/places", () => HttpResponse.json(places)),
  http.post("http://127.0.0.1:4000/api/places", async ({ request }) => {
    const body = (await request.json()) as Record<string, string | number>;
    const nextPlace = {
      id: `place-${places.length + 1}`,
      userId: String(body.userId),
      name: String(body.name),
      roadAddress: body.roadAddress ? String(body.roadAddress) : null,
      jibunAddress: body.jibunAddress ? String(body.jibunAddress) : null,
      lat: Number(body.lat),
      lng: Number(body.lng),
      createdAt: "2026-03-24T00:00:00.000Z",
      updatedAt: "2026-03-24T00:00:00.000Z"
    };

    places.unshift(nextPlace);
    return HttpResponse.json(nextPlace, { status: 201 });
  })
];

export const server = setupServer(...handlers);

export function resetMockSchedulerData() {
  appointments.splice(0, appointments.length, ...initialAppointments());
  places.splice(0, places.length, ...defaultPlaces());
}
