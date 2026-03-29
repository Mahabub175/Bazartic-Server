// category.model.ts
import { Schema, model, Types, CallbackError } from "mongoose";
import { generateSlug } from "../../utils/generateSlug";
import { ICategory } from "./category.interface";

async function resolveUniqueSlug(
  baseName: string,
  excludeId?: Types.ObjectId,
): Promise<string> {
  const CategoryModel = model<ICategory>("category");
  const baseSlug = generateSlug(baseName);

  const conflicting = await CategoryModel.find(
    {
      slug: new RegExp(`^${baseSlug}(-\\d+)?$`),
      ...(excludeId && { _id: { $ne: excludeId } }),
    },
    { slug: 1 },
  ).lean();

  if (!conflicting.length) return baseSlug;

  const existing = new Set(conflicting.map((d) => d.slug));
  if (!existing.has(baseSlug)) return baseSlug;

  let suffix = 1;
  while (existing.has(`${baseSlug}-${suffix}`)) suffix++;
  return `${baseSlug}-${suffix}`;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    level: {
      type: String,
      enum: ["parentCategory", "category", "subCategory"] as const,
      required: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "category",
      default: null,
    },
    minimumQuantity: { type: Number, default: 1, min: 1 },
    discountType: { type: String, enum: ["fixed", "percentage"] as const },
    discountValue: { type: Number, default: 0, min: 0 },
    productsCount: { type: Number, default: 0, min: 0 },
    attachment: { type: String, trim: true },
    sortingOrder: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isNewItem: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    status: { type: Boolean, default: true },
  },
  { timestamps: true },
);

categorySchema.pre("validate", async function (next) {
  try {
    if (this.isModified("name")) {
      this.slug = await resolveUniqueSlug(this.name, this._id);
    }
    next();
  } catch (err) {
    next(err as CallbackError);
  }
});

categorySchema.pre("findOneAndUpdate", async function (next) {
  try {
    const update = this.getUpdate() as Record<string, any>;
    const setUpdate: Record<string, any> = update.$set ?? update;

    if (setUpdate.name) {
      const newSlug = await resolveUniqueSlug(
        setUpdate.name,
        this.getQuery()._id,
      );
      if (update.$set) update.$set.slug = newSlug;
      else update.slug = newSlug;
      this.setUpdate(update);
    }
    next();
  } catch (err) {
    next(err as CallbackError);
  }
});

export const categoryModel = model<ICategory>("category", categorySchema);
