import request from "supertest";
import config from "../../../src/config";
import express from "../../../src/services/express";
import { Reseller } from "../../../src/api/resellers/model";
import router from "../../../src/api/resellers";

let app = () => express(config.apiRoot, router);

test("POST /resellers 201", async () => {
  let { status, body } = await request(app()).post(`${config.apiRoot}/`).send({
    cpf: "123",
    password: "123456",
    full_name: "test",
    email: "d@d.com",
  });

  expect(status).toBe(201);
  expect(typeof body).toBe("object");
  expect(body.email).toBe("d@d.com");
  expect(body.cpf).toBe("123");
  expect(body.full_name).toBe("test");
  expect(body.password).toBeUndefined();
});

test("POST /resellers 409 - cpf already exists", async () => {
  await Reseller.create({
    full_name: "reseller",
    cpf: "12345678901",
    password: "123456",
    email: "test@example.com",
  });

  let { status, body } = await request(app()).post(`${config.apiRoot}/`).send({
    cpf: "12345678901",
    password: "123456",
    full_name: "test",
    email: "d@d.com",
  });

  expect(status).toBe(409);
  expect(typeof body).toBe("object");
  expect(body.path).toBe("cpf");
  expect(body.message).toBe("CPF already registered");
});

test("POST /resellers 400 - empty payload", async () => {
  let { status, body } = await request(app()).post(`${config.apiRoot}/`);

  expect(status).toBe(400);
  expect(typeof body).toBe("object");
  expect(typeof body.validation_errors).toBeDefined();
  expect(body.validation_errors[0].path).toBe("cpf");
  expect(body.validation_errors[1].path).toBe("full_name");
  expect(body.validation_errors[2].path).toBe("password");
  expect(body.validation_errors[3].path).toBe("email");
});

test("POST /resellers 400 - invalid params", async () => {
  let { status, body } = await request(app()).post(`${config.apiRoot}/`).send({
    email: "@.com",
    password: "abc",
    cpf: "a",
    full_name: "111",
  });

  expect(status).toBe(400);
  expect(typeof body).toBe("object");
  expect(typeof body.validation_errors).toBeDefined();
  expect(body.validation_errors[0].path).toBe("email");
  expect(body.validation_errors[1].path).toBe("password");
  expect(body.validation_errors[2].path).toBe("full_name");
});
