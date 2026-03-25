import type { Request, Response } from "express";
import { HttpError } from "../../utils/http-error.js";
import { PlacesService } from "./places.service.js";

function getRouteParam(value: string | string[] | undefined, name: string) {
  if (!value || Array.isArray(value)) {
    throw new HttpError(400, `${name} is required`);
  }

  return value;
}

export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  list = async (req: Request, res: Response) => {
    const places = await this.placesService.list(req.query);
    res.json(places);
  };

  create = async (req: Request, res: Response) => {
    const place = await this.placesService.create(req.body);
    res.status(201).json(place);
  };

  update = async (req: Request, res: Response) => {
    const place = await this.placesService.update(getRouteParam(req.params.id, "id"), req.body);
    res.json(place);
  };

  remove = async (req: Request, res: Response) => {
    await this.placesService.remove(getRouteParam(req.params.id, "id"), req.query);
    res.status(204).send();
  };
}
