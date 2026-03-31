import { Schema, model } from "mongoose";
import { IAttribute } from "./attribute.interface";

const attributeSchema = new Schema<IAttribute>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    options: [{ type: Schema.Types.ObjectId, ref: "attributeOption" }],
    isDeleted: { type: Boolean, default: false },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const attributeModel = model<IAttribute>("attribute", attributeSchema);
