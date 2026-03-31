import { Document, Types } from "mongoose";

export interface IAttribute {
  name: string;
  options: string[];
}

export interface IVariant {
  sku: string;
  attributeCombination: Types.ObjectId[];
  buyingPrice: number;
  sellingPrice: number;
  offerPrice?: number;
  stock: number;
  images: string[];
}

export interface IReview {
  _id: Types.ObjectId;
  comment: string;
  user: Types.ObjectId;
  rating: number;
  images?: string;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  sku: string;
  description: string;
  video: string;
  brand?: Types.ObjectId;
  weight?: number;
  productModel?: string;
  category: Types.ObjectId;
  attachment: string;
  images: string[];
  buyingPrice: number;
  sellingPrice: number;
  offerPrice?: number;
  stock: number;
  soldCount: number;
  isVariant: boolean;
  variants?: IVariant[];
  tags?: string[];
  ratings: {
    average: number;
    count: number;
  };
  reviews: IReview[];
  isFeatured: boolean;
  isOffer: boolean;
  isAvailable: boolean;
  isDeleted: boolean;
  status: boolean;
}
