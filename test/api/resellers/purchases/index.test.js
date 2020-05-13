import request from "supertest";
import config from "../../../../src/config";
import { signSync } from "../../../../src/services/jwt";
import express from "../../../../src/services/express";
import { Reseller } from "../../../../src/api/resellers/model";
import router from "../../../../src/api/resellers";

let app = () => express(config.apiRoot, router);

let session;
let cpf = "12345678901";

beforeEach(async () => {
  await Reseller.create({
    full_name: "reseller",
    cpf: cpf,
    password: "123456",
    email: "test@example.com",
  });

  session = signSync(cpf);
});

test("GET /resellers 200", async () => {
  let { status, body } = await request(app())
    .get(`${config.apiRoot}/${cpf}/purchases`)
    .set("Authorization", "bearer " + session);

  expect(status).toBe(200);
  expect(typeof body).toBe("object");
  expect(body.next).toBeNull();
  expect(body.previous).toBeNull();
  expect(body.purchases).toBeDefined();
});

test("POST /resellers/:cpf/purchases 201, with cashback 10%", async () => {
  let { status, body } = await request(app())
    .post(`${config.apiRoot}/${cpf}/purchases`)
    .set("Authorization", "bearer " + session)
    .send({
      code: "code",
      date: "2020/04/10",
      amount: 100000,
    });

  expect(status).toBe(201);
  expect(typeof body).toBe("object");
  expect(body.amount).toBe(100000);
  expect(body.reseller_cpf).toBe(cpf);
  expect(body.code).toBe("code");
  expect(body.cashback_percentage).toBe(0.1);
  expect(body.cashback_amount).toBe(10000);
  expect(body.status).toBe("Em validação");
});

test("POST /resellers/:cpf/purchases 201, with cashback 15%", async () => {
  let { status, body } = await request(app())
    .post(`${config.apiRoot}/${cpf}/purchases`)
    .set("Authorization", "bearer " + session)
    .send({
      code: "code",
      date: "2020/04/10",
      amount: 130000,
    });

  expect(status).toBe(201);
  expect(typeof body).toBe("object");
  expect(body.amount).toBe(130000);
  expect(body.reseller_cpf).toBe(cpf);
  expect(body.code).toBe("code");
  expect(body.cashback_percentage).toBe(0.15);
  expect(body.cashback_amount).toBe(19500);
  expect(body.status).toBe("Em validação");
});

test("POST /resellers/:cpf/purchases 201, with cashback 20%", async () => {
  let { status, body } = await request(app())
    .post(`${config.apiRoot}/${cpf}/purchases`)
    .set("Authorization", "bearer " + session)
    .send({
      code: "code",
      date: "2020/04/10",
      amount: 200000,
    });

  expect(status).toBe(201);
  expect(typeof body).toBe("object");
  expect(body.amount).toBe(200000);
  expect(body.reseller_cpf).toBe(cpf);
  expect(body.code).toBe("code");
  expect(body.cashback_percentage).toBe(0.2);
  expect(body.cashback_amount).toBe(40000);
  expect(body.status).toBe("Em validação");
});

test("POST /resellers/:cpf/purchases 201, with status 'Aprovado'", async () => {
  await Reseller.create({
    full_name: "reseller",
    cpf: "15350946056",
    password: "123456",
    email: "test@example.com",
  });

  let { status, body } = await request(app())
    .post(`${config.apiRoot}/15350946056/purchases`)
    .set("Authorization", "bearer " + session)
    .send({
      code: "code",
      date: "2020/04/10",
      amount: 200000,
    });

  expect(status).toBe(201);
  expect(typeof body).toBe("object");
  expect(body.amount).toBe(200000);
  expect(body.reseller_cpf).toBe("15350946056");
  expect(body.code).toBe("code");
  expect(body.cashback_percentage).toBe(0.2);
  expect(body.cashback_amount).toBe(40000);
  expect(body.status).toBe("Aprovado");
});

test("POST /resellers/:cpf/purchases 404, reseller with CPF not found", async () => {
  let { status, body } = await request(app())
    .post(`${config.apiRoot}/123/purchases`)
    .set("Authorization", "bearer " + session)
    .send({
      code: "code",
      date: "2020/04/10",
      amount: 200000,
    });

  expect(status).toBe(404);
  expect(typeof body).toBe("object");
  expect(body.message).toBeDefined();
});
