import { Schema, model } from "mongoose";
import { IAttributeOption } from "./attributeOption.interface";

const attributeOptionSchema = new Schema<IAttributeOption>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    type: { type: String, required: true, trim: true },
    label: { type: String, trim: true },
    attachment: { type: String },
    isDeleted: { type: Boolean, default: false },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const attributeOptionModel = model<IAttributeOption>(
  "attributeOption",
  attributeOptionSchema,
);
