import { Router } from "express";
import resellersRouter from "./resellers";

const apiRouter = new Router();

apiRouter.use("/resellers", resellersRouter);

apiRouter.get("*", function (req, res) {
  res.status(404).json({ message: "Route not found" });
});

export default apiRouter;
