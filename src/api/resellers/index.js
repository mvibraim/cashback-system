import { Router } from "express";
import { createReseller, validateReseller } from "./controller";
import { auth } from "./auth/controller";
import { basic } from "../../services/passport";

import {
  indexPurchases,
  createPurchase,
  validatePurchase,
  purchasesCashback,
} from "./purchases/controller";

const resellersRouter = new Router();

resellersRouter.post("/auth", basic(), auth);

resellersRouter.post("/", validateReseller("create"), createReseller);

resellersRouter.get("/:cpf/purchases", indexPurchases);

resellersRouter.post(
  "/:cpf/purchases",
  validatePurchase("create"),
  createPurchase
);

resellersRouter.get("/:cpf/cashback", purchasesCashback);

export default resellersRouter;
