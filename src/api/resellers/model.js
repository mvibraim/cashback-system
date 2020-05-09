import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";
import { purchaseSchema } from "./purchases/purchase";

let resellerSchema = new Schema(
  {
    email: {
      type: String,
      match: /^\S+@\S+\.\S+$/,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    full_name: {
      type: String,
      match: /^[A-Za-z]+$/,
      trim: true,
      required: true,
    },
    cpf: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    purchases: [purchaseSchema],
  },
  {
    timestamps: true,
  }
);

resellerSchema.pre("save", function (next) {
  console.log("purchase added");

  this.cpf = this.cpf.replace(/\D/g, "");

  let salt = 9;

  bcrypt
    .hash(this.password, salt)
    .then((hash) => {
      this.password = hash;
      next();
    })
    .catch(next);
});

resellerSchema.methods = {
  view() {
    let view = {};
    let fields = ["id", "full_name", "cpf", "email", "createdAt", "purchases"];

    fields.forEach((field) => {
      view[field] = this[field];
    });

    return view;
  },

  authenticate(password) {
    return bcrypt
      .compare(password, this.password)
      .then((valid) => (valid ? this : false));
  },
};

let Reseller = mongoose.model("Reseller", resellerSchema);

export { Reseller };
