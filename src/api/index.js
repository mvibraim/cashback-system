import { Router } from "express";
import resellersRouter from "./resellers";

let router = new Router();

router.use("/resellers", resellersRouter);

router.get("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default router;
