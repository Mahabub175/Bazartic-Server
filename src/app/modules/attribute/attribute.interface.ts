import { Types } from "mongoose";

export interface IAttribute {
  name: string;
  options: Types.ObjectId[];
  isDeleted: boolean;
  status: boolean;
}
