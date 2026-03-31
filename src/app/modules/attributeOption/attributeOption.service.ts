import mongoose from "mongoose";
import { IAttributeOption } from "./attributeOption.interface";
import { attributeOptionModel } from "./attributeOption.model";
import { paginateAndSort } from "../../utils/paginateAndSort";
import { throwError } from "../../utils/response";
import { deleteFileSync } from "../../utils/deleteFilesFromStorage";
import { cleanObject } from "../../utils/cleanObject";

// Create a attributeOption
const createAttributeOptionService = async (
  attributeOptionData: IAttributeOption,
) => {
  const result = await attributeOptionModel.create(attributeOptionData);
  return result;
};

// Create bulk attributeOptions
const createBulkAttributeOptionsService = async (
  attributeOptions: Partial<IAttributeOption>[],
) => {
  if (!attributeOptions || !attributeOptions.length)
    throw new Error("No attributeOptions provided");

  const result = await attributeOptionModel.insertMany(attributeOptions);
  return result;
};

// Get all attributeOptions with optional pagination & search
const getAllAttributeOptionService = async (
  searchFields: string[],
  searchText?: string,
  filters?: Record<string, any>,
) => {
  const query = attributeOptionModel.find();

  return paginateAndSort(query, {
    searchFields,
    searchText,
    filters,
  });
};

// Get single attributeOption by ID
const getSingleAttributeOptionService = async (attributeOptionId: string) => {
  const queryId =
    typeof attributeOptionId === "string"
      ? new mongoose.Types.ObjectId(attributeOptionId)
      : attributeOptionId;

  const query = attributeOptionModel.find({ _id: queryId });

  const result = await paginateAndSort<IAttributeOption>(query);

  if (!result.results || !result.results.length)
    throwError("AttributeOption not found", 404);

  return result.results[0];
};

// Update single attributeOption
const updateSingleAttributeOptionService = async (
  attributeOptionId: string | number,
  attributeOptionData: Partial<IAttributeOption>,
) => {
  const queryId =
    typeof attributeOptionId === "string"
      ? new mongoose.Types.ObjectId(attributeOptionId)
      : attributeOptionId;

  const attributeOption = await attributeOptionModel.findById(queryId).exec();
  if (!attributeOption) throwError("AttributeOption not found", 404);
  else {
    attributeOptionData = cleanObject(attributeOptionData);

    if (
      attributeOptionData.attachment &&
      attributeOption.attachment &&
      attributeOptionData.attachment !== attributeOption.attachment
    ) {
      deleteFileSync(attributeOption.attachment);
    }

    const updated = await attributeOptionModel
      .findByIdAndUpdate(
        queryId,
        { $set: attributeOptionData },
        { new: true, runValidators: true, context: "query" },
      )
      .exec();

    if (!updated) throwError("AttributeOption update failed", 500);

    return updated;
  }
};

// Toggle attributeOption status
const toggleAttributeOptionStatusService = async (
  attributeOptionId: string,
) => {
  if (!mongoose.Types.ObjectId.isValid(attributeOptionId)) {
    throwError("Invalid attributeOption ID", 400);
  }

  const attributeOption = await attributeOptionModel.findOne({
    _id: attributeOptionId,
    isDeleted: { $ne: true },
  });

  if (!attributeOption)
    throwError("AttributeOption not found or already deleted", 404);
  else {
    attributeOption.status = !attributeOption.status;
    await attributeOption.save();

    return attributeOption.toObject();
  }
};

// Toggle multiple attributeOption status
const toggleManyAttributeOptionStatusService = async (
  attributeOptionIds: string[],
) => {
  const validIds = attributeOptionIds.filter((id) =>
    mongoose.Types.ObjectId.isValid(id),
  );
  if (!validIds.length)
    throwError("No valid attributeOption IDs provided!", 400);

  const result = await attributeOptionModel.updateMany(
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
    throwError("No attributeOptions found or all are deleted!", 404);

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
  };
};

// Soft delete single attributeOption
const softDeleteSingleAttributeOptionService = async (
  attributeOptionId: string | number,
) => {
  const queryId =
    typeof attributeOptionId === "string"
      ? new mongoose.Types.ObjectId(attributeOptionId)
      : attributeOptionId;

  const attributeOption = await attributeOptionModel.findById(queryId).exec();
  if (!attributeOption) throwError("AttributeOption not found", 404);
  else {
    if (attributeOption.isDeleted)
      throwError("AttributeOption already soft deleted!", 400);

    const softDeleted = await attributeOptionModel
      .findByIdAndUpdate(queryId, { $set: { isDeleted: true } }, { new: true })
      .exec();

    if (!softDeleted) throwError("AttributeOption soft delete failed!", 500);

    return softDeleted;
  }
};

// Toggle attributeOption soft delete
const toggleAttributeOptionSoftDeleteService = async (
  attributeOptionId: string,
) => {
  if (!mongoose.Types.ObjectId.isValid(attributeOptionId)) {
    throwError("Invalid attributeOption ID", 400);
  }

  const attributeOption = await attributeOptionModel.findOne({
    _id: attributeOptionId,
  });

  if (!attributeOption) throwError("AttributeOption not found!", 404);
  else {
    attributeOption.isDeleted = !attributeOption.isDeleted;
    await attributeOption.save();

    return attributeOption.toObject();
  }
};

// Toggle Soft delete multiple attributeOptions
const toggleManyAttributeOptionSoftDeleteService = async (
  attributeOptionIds: string[],
) => {
  const validIds = attributeOptionIds.filter((id) =>
    mongoose.Types.ObjectId.isValid(id),
  );
  if (!validIds.length)
    throwError("No valid attributeOption IDs provided!", 400);

  const result = await attributeOptionModel.updateMany(
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
    throwError("No attributeOptions found!", 404);
  }

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
  };
};

// Recover attributeOption
const recoverAttributeOptionService = async (attributeOptionIds: string[]) => {
  if (!Array.isArray(attributeOptionIds) || attributeOptionIds.length === 0) {
    throw new Error("No attributeOption IDs provided");
  }

  const validIds = attributeOptionIds.filter((id) =>
    mongoose.Types.ObjectId.isValid(id),
  );
  if (validIds.length === 0) {
    throw new Error("No valid attributeOption IDs provided");
  }

  const result = await attributeOptionModel.updateMany(
    { _id: { $in: validIds } },
    { $set: { isDeleted: false } },
  );

  return {
    modifiedCount: result.modifiedCount,
    matchedCount: result.matchedCount,
  };
};

// Recover all attributeOption
const recoverAllAttributeOptionService = async () => {
  const result = await attributeOptionModel.updateMany(
    { isDeleted: true },
    { $set: { isDeleted: false } },
  );

  return {
    modifiedCount: result.modifiedCount,
    matchedCount: result.matchedCount,
  };
};

// Soft delete many attributeOptions
const softDeleteManyAttributeOptionsService = async (
  attributeOptionIds: (string | number)[],
) => {
  if (!attributeOptionIds || !attributeOptionIds.length)
    throwError("No attributeOption IDs provided", 400);

  const queryIds = attributeOptionIds.map((id) =>
    typeof id === "string" && mongoose.Types.ObjectId.isValid(id)
      ? new mongoose.Types.ObjectId(id)
      : typeof id === "number"
        ? id
        : throwError(`Invalid attributeOption ID: ${id}`, 400),
  );

  const result = await attributeOptionModel.updateMany(
    { _id: { $in: queryIds }, isDeleted: false },
    { $set: { isDeleted: true } },
  );

  if (!result.modifiedCount)
    throwError("No attributeOptions were soft deleted", 404);

  return result;
};

// Hard delete single attributeOption
const hardDeleteSingleAttributeOptionService = async (
  attributeOptionId: string | number,
) => {
  const queryId =
    typeof attributeOptionId === "string"
      ? new mongoose.Types.ObjectId(attributeOptionId)
      : attributeOptionId;

  const attributeOption = await attributeOptionModel.findById(queryId).exec();
  if (!attributeOption) throwError("AttributeOption not found", 404);
  else {
    if (attributeOption.attachment) {
      deleteFileSync(attributeOption.attachment);
    }

    const deleted = await attributeOptionModel
      .findByIdAndDelete(queryId)
      .exec();
    if (!deleted) throwError("AttributeOption delete failed", 500);

    return deleted;
  }
};

// Hard delete many attributeOptions
const hardDeleteManyAttributeOptionsService = async (
  attributeOptionIds: (string | number)[],
) => {
  const queryIds = attributeOptionIds.map((id) => {
    if (typeof id === "string" && mongoose.Types.ObjectId.isValid(id))
      return new mongoose.Types.ObjectId(id);
    else if (typeof id === "number") return id;
    else throwError(`Invalid ID format: ${id}`, 400);
  });

  const attributeOptions = await attributeOptionModel
    .find({ _id: { $in: queryIds } })
    .exec();

  for (const attributeOption of attributeOptions) {
    if (attributeOption?.attachment) {
      deleteFileSync(attributeOption.attachment);
    }
  }

  const result = await attributeOptionModel
    .deleteMany({ _id: { $in: queryIds } })
    .exec();
  return result;
};

export const attributeOptionServices = {
  createAttributeOptionService,
  createBulkAttributeOptionsService,
  getAllAttributeOptionService,
  getSingleAttributeOptionService,
  updateSingleAttributeOptionService,
  toggleAttributeOptionStatusService,
  toggleManyAttributeOptionStatusService,
  softDeleteSingleAttributeOptionService,
  toggleAttributeOptionSoftDeleteService,
  toggleManyAttributeOptionSoftDeleteService,
  softDeleteManyAttributeOptionsService,
  recoverAllAttributeOptionService,
  recoverAttributeOptionService,
  hardDeleteSingleAttributeOptionService,
  hardDeleteManyAttributeOptionsService,
};
