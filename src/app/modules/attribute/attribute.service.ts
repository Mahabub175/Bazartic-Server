import mongoose from "mongoose";
import { IAttribute } from "./attribute.interface";
import { attributeModel } from "./attribute.model";
import { paginateAndSort } from "../../utils/paginateAndSort";
import { throwError } from "../../utils/response";
import { deleteFileSync } from "../../utils/deleteFilesFromStorage";
import { cleanObject } from "../../utils/cleanObject";

// Create a attribute
const createAttributeService = async (attributeData: IAttribute) => {
  const result = await attributeModel.create(attributeData);
  return result;
};

// Create bulk attributes
const createBulkAttributesService = async (
  attributes: Partial<IAttribute>[],
) => {
  if (!attributes || !attributes.length)
    throw new Error("No attributes provided");

  const result = await attributeModel.insertMany(attributes);
  return result;
};

// Get all attributes with optional pagination & search
const getAllAttributeService = async (
  searchFields: string[],
  searchText?: string,
  filters?: Record<string, any>,
) => {
  const query = attributeModel.find().populate("options");

  return paginateAndSort(query, {
    searchFields,
    searchText,
    filters,
  });
};

// Get single attribute by ID
const getSingleAttributeService = async (attributeId: string) => {
  const queryId =
    typeof attributeId === "string"
      ? new mongoose.Types.ObjectId(attributeId)
      : attributeId;

  const query = attributeModel.find({ _id: queryId }).populate("options");

  const result = await paginateAndSort<IAttribute>(query);

  if (!result.results || !result.results.length)
    throwError("Attribute not found", 404);

  return result.results[0];
};

// Update single attribute
const updateSingleAttributeService = async (
  attributeId: string | number,
  attributeData: Partial<IAttribute>,
) => {
  const queryId =
    typeof attributeId === "string"
      ? new mongoose.Types.ObjectId(attributeId)
      : attributeId;

  const attribute = await attributeModel.findById(queryId).exec();
  if (!attribute) throwError("Attribute not found", 404);
  else {
    attributeData = cleanObject(attributeData);

    const updated = await attributeModel
      .findByIdAndUpdate(
        queryId,
        { $set: attributeData },
        { new: true, runValidators: true, context: "query" },
      )
      .exec();

    if (!updated) throwError("Attribute update failed", 500);

    return updated;
  }
};

// Toggle attribute status
const toggleAttributeStatusService = async (attributeId: string) => {
  if (!mongoose.Types.ObjectId.isValid(attributeId)) {
    throwError("Invalid attribute ID", 400);
  }

  const attribute = await attributeModel.findOne({
    _id: attributeId,
    isDeleted: { $ne: true },
  });

  if (!attribute) throwError("Attribute not found or already deleted", 404);
  else {
    attribute.status = !attribute.status;
    await attribute.save();

    return attribute.toObject();
  }
};

// Toggle multiple attribute status
const toggleManyAttributeStatusService = async (attributeIds: string[]) => {
  const validIds = attributeIds.filter((id) =>
    mongoose.Types.ObjectId.isValid(id),
  );
  if (!validIds.length) throwError("No valid attribute IDs provided!", 400);

  const result = await attributeModel.updateMany(
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
    throwError("No attributes found or all are deleted!", 404);

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
  };
};

// Soft delete single attribute
const softDeleteSingleAttributeService = async (
  attributeId: string | number,
) => {
  const queryId =
    typeof attributeId === "string"
      ? new mongoose.Types.ObjectId(attributeId)
      : attributeId;

  const attribute = await attributeModel.findById(queryId).exec();
  if (!attribute) throwError("Attribute not found", 404);
  else {
    if (attribute.isDeleted) throwError("Attribute already soft deleted!", 400);

    const softDeleted = await attributeModel
      .findByIdAndUpdate(queryId, { $set: { isDeleted: true } }, { new: true })
      .exec();

    if (!softDeleted) throwError("Attribute soft delete failed!", 500);

    return softDeleted;
  }
};

// Toggle attribute soft delete
const toggleAttributeSoftDeleteService = async (attributeId: string) => {
  if (!mongoose.Types.ObjectId.isValid(attributeId)) {
    throwError("Invalid attribute ID", 400);
  }

  const attribute = await attributeModel.findOne({
    _id: attributeId,
  });

  if (!attribute) throwError("Attribute not found!", 404);
  else {
    attribute.isDeleted = !attribute.isDeleted;
    await attribute.save();

    return attribute.toObject();
  }
};

// Toggle Soft delete multiple attributes
const toggleManyAttributeSoftDeleteService = async (attributeIds: string[]) => {
  const validIds = attributeIds.filter((id) =>
    mongoose.Types.ObjectId.isValid(id),
  );
  if (!validIds.length) throwError("No valid attribute IDs provided!", 400);

  const result = await attributeModel.updateMany(
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
    throwError("No attributes found!", 404);
  }

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
  };
};

// Recover attribute
const recoverAttributeService = async (attributeIds: string[]) => {
  if (!Array.isArray(attributeIds) || attributeIds.length === 0) {
    throw new Error("No attribute IDs provided");
  }

  const validIds = attributeIds.filter((id) =>
    mongoose.Types.ObjectId.isValid(id),
  );
  if (validIds.length === 0) {
    throw new Error("No valid attribute IDs provided");
  }

  const result = await attributeModel.updateMany(
    { _id: { $in: validIds } },
    { $set: { isDeleted: false } },
  );

  return {
    modifiedCount: result.modifiedCount,
    matchedCount: result.matchedCount,
  };
};

// Recover all attribute
const recoverAllAttributeService = async () => {
  const result = await attributeModel.updateMany(
    { isDeleted: true },
    { $set: { isDeleted: false } },
  );

  return {
    modifiedCount: result.modifiedCount,
    matchedCount: result.matchedCount,
  };
};

// Soft delete many attributes
const softDeleteManyAttributesService = async (
  attributeIds: (string | number)[],
) => {
  if (!attributeIds || !attributeIds.length)
    throwError("No attribute IDs provided", 400);

  const queryIds = attributeIds.map((id) =>
    typeof id === "string" && mongoose.Types.ObjectId.isValid(id)
      ? new mongoose.Types.ObjectId(id)
      : typeof id === "number"
        ? id
        : throwError(`Invalid attribute ID: ${id}`, 400),
  );

  const result = await attributeModel.updateMany(
    { _id: { $in: queryIds }, isDeleted: false },
    { $set: { isDeleted: true } },
  );

  if (!result.modifiedCount) throwError("No attributes were soft deleted", 404);

  return result;
};

// Hard delete single attribute
const hardDeleteSingleAttributeService = async (
  attributeId: string | number,
) => {
  const queryId =
    typeof attributeId === "string"
      ? new mongoose.Types.ObjectId(attributeId)
      : attributeId;

  const attribute = await attributeModel.findById(queryId).exec();
  if (!attribute) throwError("Attribute not found", 404);
  else {
    const deleted = await attributeModel.findByIdAndDelete(queryId).exec();
    if (!deleted) throwError("Attribute delete failed", 500);

    return deleted;
  }
};

// Hard delete many attributes
const hardDeleteManyAttributesService = async (
  attributeIds: (string | number)[],
) => {
  const queryIds = attributeIds.map((id) => {
    if (typeof id === "string" && mongoose.Types.ObjectId.isValid(id))
      return new mongoose.Types.ObjectId(id);
    else if (typeof id === "number") return id;
    else throwError(`Invalid ID format: ${id}`, 400);
  });

  const attributes = await attributeModel
    .find({ _id: { $in: queryIds } })
    .exec();

  const result = await attributeModel
    .deleteMany({ _id: { $in: queryIds } })
    .exec();
  return result;
};

export const attributeServices = {
  createAttributeService,
  createBulkAttributesService,
  getAllAttributeService,
  getSingleAttributeService,
  updateSingleAttributeService,
  toggleAttributeStatusService,
  toggleManyAttributeStatusService,
  softDeleteSingleAttributeService,
  toggleAttributeSoftDeleteService,
  toggleManyAttributeSoftDeleteService,
  softDeleteManyAttributesService,
  recoverAllAttributeService,
  recoverAttributeService,
  hardDeleteSingleAttributeService,
  hardDeleteManyAttributesService,
};
