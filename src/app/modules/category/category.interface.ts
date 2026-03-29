import { Types } from "mongoose";

export interface ICategory {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  level: "parentCategory" | "category" | "subCategory";
  parent: Types.ObjectId | null;
  minimumQuantity: number;
  discountType?: "fixed" | "percentage";
  discountValue: number;
  productsCount: number;
  attachment?: string;
  sortingOrder: number;
  isFeatured: boolean;
  isNewItem: boolean;
  isDeleted: boolean;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}
