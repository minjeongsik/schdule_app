import { PrismaClient, TransportMode } from "@prisma/client";
import { fileURLToPath } from "node:url";

const databasePath = fileURLToPath(new URL("./dev.db", import.meta.url)).replace(/\\/g, "/");
process.env.DATABASE_URL = `file:${databasePath}`;

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {
      id: "demo-user",
      name: "Demo User"
    },
    create: {
      id: "demo-user",
      email: "demo@example.com",
      passwordHash: "demo-password-hash",
      name: "Demo User"
    }
  });

  await prisma.place.upsert({
    where: { id: "home-place" },
    update: {
      userId: "demo-user"
    },
    create: {
      id: "home-place",
      userId: "demo-user",
      name: "Home",
      roadAddress: "1 Teheran-ro, Gangnam-gu, Seoul",
      lat: 37.498095,
      lng: 127.02761
    }
  });

  await prisma.place.upsert({
    where: { id: "office-place" },
    update: {
      userId: "demo-user"
    },
    create: {
      id: "office-place",
      userId: "demo-user",
      name: "Office",
      roadAddress: "110 Sejong-daero, Jung-gu, Seoul",
      lat: 37.5662952,
      lng: 126.9779451
    }
  });

  await prisma.appointment.upsert({
    where: { id: "demo-appointment" },
    update: {},
    create: {
      id: "demo-appointment",
      userId: "demo-user",
      title: "Initial appointment sample",
      memo: "Sample data for appointments CRUD",
      startAt: new Date("2026-03-25T01:00:00.000Z"),
      endAt: new Date("2026-03-25T02:00:00.000Z"),
      transportMode: TransportMode.TRANSIT,
      originPlaceId: "home-place",
      destinationPlaceId: "office-place"
    }
  });

  await prisma.savedRoute.upsert({
    where: { id: "demo-route-fastest" },
    update: {},
    create: {
      id: "demo-route-fastest",
      appointmentId: "demo-appointment",
      originPlaceId: "home-place",
      destinationPlaceId: "office-place",
      summary: "Fastest transit candidate",
      distanceMeters: 12000,
      durationSeconds: 2400,
      routePolylineJson: null,
      selectedOption: true
    }
  });

  await prisma.savedRoute.upsert({
    where: { id: "demo-route-walk" },
    update: {},
    create: {
      id: "demo-route-walk",
      appointmentId: "demo-appointment",
      originPlaceId: "home-place",
      destinationPlaceId: "office-place",
      summary: "Walking-heavy candidate",
      distanceMeters: 9800,
      durationSeconds: 4200,
      routePolylineJson: null,
      selectedOption: false
    }
  });

  await prisma.waypoint.upsert({
    where: {
      routeId_sequence: {
        routeId: "demo-route-fastest",
        sequence: 1
      }
    },
    update: {},
    create: {
      routeId: "demo-route-fastest",
      sequence: 1,
      name: "Transfer stop",
      lat: 37.5142,
      lng: 127.0418
    }
  });

  await prisma.waypoint.upsert({
    where: {
      routeId_sequence: {
        routeId: "demo-route-walk",
        sequence: 1
      }
    },
    update: {},
    create: {
      routeId: "demo-route-walk",
      sequence: 1,
      name: "Coffee stop",
      lat: 37.529,
      lng: 127.012
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
