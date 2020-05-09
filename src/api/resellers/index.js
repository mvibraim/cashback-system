import { Router } from "express";
import { createReseller } from "./controller";
import { auth } from "./auth/controller";
import { basic, jwt } from "../../services/passport";

import {
  indexPurchases,
  createPurchase,
  purchasesCashback,
} from "./purchases/controller";

let resellersRouter = new Router();

resellersRouter.post("/auth", basic(), auth);
resellersRouter.post("/", createReseller);
resellersRouter.get("/:cpf/purchases", jwt({ required: true }), indexPurchases);

resellersRouter.post(
  "/:cpf/purchases",
  jwt({ required: true }),
  createPurchase
);

resellersRouter.get(
  "/:cpf/cashback",
  jwt({ required: true }),
  purchasesCashback
);

export default resellersRouter;
