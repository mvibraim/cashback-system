import { Router } from "express";
import { createReseller, validateReseller } from "./controller";
import { auth } from "./auth/controller";
import { basic, jwt } from "../../services/passport";

import {
  indexPurchases,
  createPurchase,
  validatePurchase,
  purchasesCashback,
} from "./purchases/controller";

const resellersRouter = new Router();

resellersRouter.post("/auth", basic(), auth);

resellersRouter.post("/", validateReseller("create"), createReseller);

resellersRouter.get("/:cpf/purchases", jwt({ required: true }), indexPurchases);

resellersRouter.post(
  "/:cpf/purchases",
  jwt({ required: true }),
  validatePurchase("create"),
  createPurchase
);

resellersRouter.get(
  "/:cpf/cashback",
  jwt({ required: true }),
  purchasesCashback
);

export default resellersRouter;
