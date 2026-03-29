import { FastifyInstance } from "fastify";
import mongoose from "mongoose";
import { IBrand } from "./brand.interface";
import { brandModel } from "./brand.model";
import { paginateAndSort } from "../../utils/paginateAndSort";
import { throwError } from "../../utils/response";
import { deleteFileSync } from "../../utils/deleteFilesFromStorage";
import { cleanObject } from "../../utils/cleanObject";

// Create a brand
const createBrandService = async (brandData: IBrand) => {
  const result = await brandModel.create(brandData);
  return result;
};

// Create bulk brands
const createBulkBrandsService = async (brands: Partial<IBrand>[]) => {
  if (!brands || !brands.length) throw new Error("No brands provided");

  const result = await brandModel.insertMany(brands);
  return result;
};

// Get all brands with optional pagination & search
const getAllBrandService = async (
  searchFields: string[],
  searchText?: string,
  filters?: Record<string, any>,
) => {
  const query = brandModel.find();

  return paginateAndSort(query, {
    searchFields,
    searchText,
    filters,
  });
};

// Get single brand by ID
const getSingleBrandService = async (brandId: string) => {
  const queryId =
    typeof brandId === "string"
      ? new mongoose.Types.ObjectId(brandId)
      : brandId;

  const query = brandModel.find({ _id: queryId });

  const result = await paginateAndSort<IBrand>(query);

  if (!result.results || !result.results.length)
    throwError("Brand not found", 404);

  return result.results[0];
};

// Get single brand by slug
const getSingleBrandBySlugService = async (slug: string) => {
  const query = brandModel.find({ slug });

  const result = await paginateAndSort<IBrand>(query);

  if (!result.results || !result.results.length)
    throwError("Brand not found!", 404);

  return result.results[0];
};

// Update single brand
const updateSingleBrandService = async (
  brandId: string | number,
  brandData: Partial<IBrand>,
) => {
  const queryId =
    typeof brandId === "string"
      ? new mongoose.Types.ObjectId(brandId)
      : brandId;

  const brand = await brandModel.findById(queryId).exec();
  if (!brand) throwError("Brand not found", 404);
  else {
    brandData = cleanObject(brandData);

    if (
      brandData.attachment &&
      brand.attachment &&
      brandData.attachment !== brand.attachment
    ) {
      deleteFileSync(brand.attachment);
    }

    const updated = await brandModel
      .findByIdAndUpdate(
        queryId,
        { $set: brandData },
        { new: true, runValidators: true, context: "query" },
      )
      .exec();

    if (!updated) throwError("Brand update failed", 500);

    return updated;
  }
};

// Toggle brand status
const toggleBrandStatusService = async (brandId: string) => {
  if (!mongoose.Types.ObjectId.isValid(brandId)) {
    throwError("Invalid brand ID", 400);
  }

  const brand = await brandModel.findOne({
    _id: brandId,
    isDeleted: { $ne: true },
  });

  if (!brand) throwError("Brand not found or already deleted", 404);
  else {
    brand.status = !brand.status;
    await brand.save();

    return brand.toObject();
  }
};

// Toggle multiple brand status
const toggleManyBrandStatusService = async (brandIds: string[]) => {
  const validIds = brandIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (!validIds.length) throwError("No valid brand IDs provided!", 400);

  const result = await brandModel.updateMany(
    {
      _id: { $in: validIds },
      isDeleted: { $ne: true },
    },
    [
      {
        $set: {
          status: { $not: "$status" },
        },
      },
    ],
  );

  if (result.matchedCount === 0)
    throwError("No brands found or all are deleted!", 404);

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
  };
};

// Soft delete single brand
const softDeleteSingleBrandService = async (brandId: string | number) => {
  const queryId =
    typeof brandId === "string"
      ? new mongoose.Types.ObjectId(brandId)
      : brandId;

  const brand = await brandModel.findById(queryId).exec();
  if (!brand) throwError("Brand not found", 404);
  else {
    if (brand.isDeleted) throwError("Brand already soft deleted!", 400);

    const softDeleted = await brandModel
      .findByIdAndUpdate(queryId, { $set: { isDeleted: true } }, { new: true })
      .exec();

    if (!softDeleted) throwError("Brand soft delete failed!", 500);

    return softDeleted;
  }
};

// Toggle brand soft delete
const toggleBrandSoftDeleteService = async (brandId: string) => {
  if (!mongoose.Types.ObjectId.isValid(brandId)) {
    throwError("Invalid brand ID", 400);
  }

  const brand = await brandModel.findOne({
    _id: brandId,
  });

  if (!brand) throwError("Brand not found!", 404);
  else {
    brand.isDeleted = !brand.isDeleted;
    await brand.save();

    return brand.toObject();
  }
};

// Toggle Soft delete multiple brands
const toggleManyBrandSoftDeleteService = async (brandIds: string[]) => {
  const validIds = brandIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (!validIds.length) throwError("No valid brand IDs provided!", 400);

  const result = await brandModel.updateMany(
    {
      _id: { $in: validIds },
    },
    [
      {
        $set: {
          isDeleted: { $not: "$isDeleted" },
        },
      },
    ],
  );

  if (result.matchedCount === 0) {
    throwError("No brands found!", 404);
  }

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
  };
};

// Recover brand
const recoverBrandService = async (brandIds: string[]) => {
  if (!Array.isArray(brandIds) || brandIds.length === 0) {
    throw new Error("No brand IDs provided");
  }

  const validIds = brandIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (validIds.length === 0) {
    throw new Error("No valid brand IDs provided");
  }

  const result = await brandModel.updateMany(
    { _id: { $in: validIds } },
    { $set: { isDeleted: false } },
  );

  return {
    modifiedCount: result.modifiedCount,
    matchedCount: result.matchedCount,
  };
};

// Recover all brand
const recoverAllBrandService = async () => {
  const result = await brandModel.updateMany(
    { isDeleted: true },
    { $set: { isDeleted: false } },
  );

  return {
    modifiedCount: result.modifiedCount,
    matchedCount: result.matchedCount,
  };
};

// Soft delete many brands
const softDeleteManyBrandsService = async (brandIds: (string | number)[]) => {
  if (!brandIds || !brandIds.length) throwError("No brand IDs provided", 400);

  const queryIds = brandIds.map((id) =>
    typeof id === "string" && mongoose.Types.ObjectId.isValid(id)
      ? new mongoose.Types.ObjectId(id)
      : typeof id === "number"
        ? id
        : throwError(`Invalid brand ID: ${id}`, 400),
  );

  const result = await brandModel.updateMany(
    { _id: { $in: queryIds }, isDeleted: false },
    { $set: { isDeleted: true } },
  );

  if (!result.modifiedCount) throwError("No brands were soft deleted", 404);

  return result;
};

// Hard delete single brand
const hardDeleteSingleBrandService = async (brandId: string | number) => {
  const queryId =
    typeof brandId === "string"
      ? new mongoose.Types.ObjectId(brandId)
      : brandId;

  const brand = await brandModel.findById(queryId).exec();
  if (!brand) throwError("Brand not found", 404);
  else {
    if (brand.attachment) {
      deleteFileSync(brand.attachment);
    }

    const deleted = await brandModel.findByIdAndDelete(queryId).exec();
    if (!deleted) throwError("Brand delete failed", 500);

    return deleted;
  }
};

// Hard delete many brands
const hardDeleteManyBrandsService = async (brandIds: (string | number)[]) => {
  const queryIds = brandIds.map((id) => {
    if (typeof id === "string" && mongoose.Types.ObjectId.isValid(id))
      return new mongoose.Types.ObjectId(id);
    else if (typeof id === "number") return id;
    else throwError(`Invalid ID format: ${id}`, 400);
  });

  const brands = await brandModel.find({ _id: { $in: queryIds } }).exec();

  for (const brand of brands) {
    if (brand?.attachment) {
      deleteFileSync(brand.attachment);
    }
  }

  const result = await brandModel.deleteMany({ _id: { $in: queryIds } }).exec();
  return result;
};

export const brandServices = {
  createBrandService,
  createBulkBrandsService,
  getAllBrandService,
  getSingleBrandService,
  getSingleBrandBySlugService,
  updateSingleBrandService,
  toggleBrandStatusService,
  toggleManyBrandStatusService,
  softDeleteSingleBrandService,
  toggleBrandSoftDeleteService,
  toggleManyBrandSoftDeleteService,
  softDeleteManyBrandsService,
  recoverBrandService,
  recoverAllBrandService,
  hardDeleteSingleBrandService,
  hardDeleteManyBrandsService,
};
