import { Schema, model } from "mongoose";
import { IBrand } from "./brand.interface";
import { generateSlug } from "../../utils/generateSlug";

const brandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
    logo: { type: String },
    website: { type: String, trim: true },
    attachment: { type: String },
    isDeleted: { type: Boolean, default: false },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

brandSchema.pre("validate", async function (next) {
  if (this.isModified("name")) {
    let newSlug = generateSlug(this.name);
    let slugExists = await model<IBrand>("brand").exists({
      slug: newSlug,
      _id: { $ne: this._id },
    });
    let suffix = 1;

    while (slugExists) {
      newSlug = `${generateSlug(this.name)}-${suffix}`;
      slugExists = await model<IBrand>("brand").exists({
        slug: newSlug,
        _id: { $ne: this._id },
      });
      suffix++;
    }

    this.slug = newSlug;
  }

  next();
});

brandSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() as any;

  const setUpdate = update.$set ? update.$set : update;

  if (setUpdate.name) {
    let newSlug = generateSlug(setUpdate.name);

    let slugExists = await model<IBrand>("brand").exists({
      slug: newSlug,
      _id: { $ne: this.getQuery()._id },
    });

    let suffix = 1;
    while (slugExists) {
      newSlug = `${generateSlug(setUpdate.name)}-${suffix}`;
      slugExists = await model<IBrand>("brand").exists({
        slug: newSlug,
        _id: { $ne: this.getQuery()._id },
      });
      suffix++;
    }

    if (update.$set) {
      update.$set.slug = newSlug;
    } else {
      update.slug = newSlug;
    }

    this.setUpdate(update);
  }

  next();
});

export const brandModel = model<IBrand>("brand", brandSchema);
