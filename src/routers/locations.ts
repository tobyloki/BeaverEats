import { Router } from "express";

export const locationsRouter = Router();

const demoData =[
  {
    "name": "Trader Bing's",
    "area": "Austin Hall",
    "address": "2751 SW Jefferson Way Corvallis, OR 97331",
    "description": "Example description",
    "latitude": 44.565050,
    "longitude": -123.282096,
    "usesDiningDollars": true,
    "startHours": "07:30",
    "endHours": "18:00"
  }
]

locationsRouter.get("/", (req, res) => {
  res.json(demoData);
});
