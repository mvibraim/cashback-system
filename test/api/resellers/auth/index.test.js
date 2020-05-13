import request from "supertest";
import config from "../../../../src/config";
import { Reseller } from "../../../../src/api/resellers/model";
import { verify } from "../../../../src/services/jwt";
import express from "../../../../src/services/express";
import router from "../../../../src/api/resellers";

let app = () => express(config.apiRoot, router);

let cpf = "12345678901";
let password = "12345678";

beforeAll(async () => {
  await Reseller.create({
    email: "test@example.com",
    password: password,
    cpf: cpf,
    full_name: "aa",
  });
});

test("POST /auth 201", async () => {
  let { status, body } = await request(app())
    .post(`${config.apiRoot}/auth`)
    .auth(cpf, password);

  expect(status).toBe(201);
  expect(typeof body).toBe("object");
  expect(typeof body.token).toBe("string");
  expect(await verify(body.token)).toBeTruthy();
});

test("POST /auth 401 - invalid cpf (reseller doesn't exist)", async () => {
  let { status } = await request(app())
    .post(`${config.apiRoot}/auth`)
    .auth("invalid", password);

  expect(status).toBe(401);
});

test("POST /auth 401 - wrong password", async () => {
  let { status } = await request(app())
    .post(`${config.apiRoot}/auth`)
    .auth(cpf, "123");

  expect(status).toBe(401);
});

test("POST /auth 401 - missing auth", async () => {
  let { status } = await request(app()).post(`${config.apiRoot}/auth`);

  expect(status).toBe(401);
});
