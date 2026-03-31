import { FastifyRequest, FastifyReply } from "fastify";
import { attributeOptionServices } from "./attributeOption.service";
import { responseError, responseSuccess } from "../../utils/response";
import { IAttributeOption } from "./attributeOption.interface";
import {
  parseMultipartBody,
  parseQueryFilters,
} from "../../utils/parsedBodyData";
import { uploadService } from "../upload/upload.service";

// Create a attributeOption
const createAttributeOptionController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const data = parseMultipartBody(req.body as Record<string, any>);

    const attachmentPath = await uploadService(req, "attachment");

    const formData = {
      ...data,
      ...(attachmentPath ? { attachment: attachmentPath } : {}),
    };

    const result = await attributeOptionServices.createAttributeOptionService(
      formData as IAttributeOption,
    );

    return responseSuccess(
      reply,
      result,
      "AttributeOption Created Successfully",
    );
  } catch (error: any) {
    throw error;
  }
};

// Create bulk attributeOptions
const createBulkAttributeOptionsController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const attributeOptions = parseMultipartBody(
      req.body as Record<string, any>,
    );

    if (!Array.isArray(attributeOptions) || !attributeOptions.length) {
      return responseError(reply, "No attributeOptions provided", 400);
    }

    const createdAttributeOptions =
      await attributeOptionServices.createBulkAttributeOptionsService(
        attributeOptions,
      );

    return responseSuccess(
      reply,
      createdAttributeOptions,
      `${createdAttributeOptions.length} attributeOptions created successfully`,
    );
  } catch (err: any) {
    return responseError(
      reply,
      err.message || "Failed to create attributeOptions",
      500,
      err,
    );
  }
};

// Get all attributeOptions
const getAllAttributeOptionController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const searchFields = ["name"];

    const { filters, searchText } = parseQueryFilters(
      req.query as Record<string, any>,
    );

    const result = await attributeOptionServices.getAllAttributeOptionService(
      searchFields,
      searchText,
      filters,
    );

    return responseSuccess(
      reply,
      result,
      "AttributeOptions Fetched Successfully!",
    );
  } catch (error: any) {
    throw error;
  }
};

// Get single attributeOption by ID
const getSingleAttributeOptionController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = req.params as { attributeOptionId: string };
    const result =
      await attributeOptionServices.getSingleAttributeOptionService(
        params.attributeOptionId,
      );

    return responseSuccess(
      reply,
      result,
      "AttributeOption Fetched Successfully!",
    );
  } catch (error: any) {
    throw error;
  }
};

// Update single attributeOption
const updateSingleAttributeOptionController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = req.params as { attributeOptionId: string };
    const data = parseMultipartBody(req.body as Record<string, any>);
    const attributeOptionData: Partial<IAttributeOption> = { ...data };

    const attachmentPath = await uploadService(req, "attachment");
    if (attachmentPath && typeof attachmentPath === "string") {
      attributeOptionData.attachment = attachmentPath;
    }

    const result =
      await attributeOptionServices.updateSingleAttributeOptionService(
        params.attributeOptionId,
        attributeOptionData as IAttributeOption,
      );

    return responseSuccess(
      reply,
      result,
      "AttributeOption Updated Successfully!",
    );
  } catch (error: any) {
    console.error("Update attributeOption error:", error);
    throw error;
  }
};

// Toggle attributeOption status
const toggleAttributeOptionStatusController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = req.params as { attributeOptionId: string };
    await attributeOptionServices.toggleAttributeOptionStatusService(
      params.attributeOptionId,
    );

    return responseSuccess(
      reply,
      null,
      "AttributeOption Status Toggled Successfully!",
    );
  } catch (error: any) {
    throw error;
  }
};

// Toggle many attributeOption status
const toggleManyAttributeOptionStatusController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const attributeOptionIds = req.body as string[];

    if (
      !attributeOptionIds ||
      !Array.isArray(attributeOptionIds) ||
      attributeOptionIds.length === 0
    ) {
      return responseError(
        reply,
        "Invalid or empty AttributeOption IDs array provided",
        500,
      );
    }

    const result =
      await attributeOptionServices.toggleManyAttributeOptionStatusService(
        attributeOptionIds,
      );

    return responseSuccess(
      reply,
      null,
      `Toggled Status for ${result.modifiedCount} AttributeOptions Successfully! `,
    );
  } catch (error: any) {
    throw error;
  }
};

// Soft delete single attributeOption
const softDeleteSingleAttributeOptionController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = req.params as { attributeOptionId: string };
    await attributeOptionServices.softDeleteSingleAttributeOptionService(
      params.attributeOptionId,
    );

    return responseSuccess(
      reply,
      null,
      "AttributeOption Soft Deleted Successfully!",
    );
  } catch (error: any) {
    throw error;
  }
};

// Toggle attributeOption soft delete
const toggleAttributeOptionSoftDeleteController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = req.params as { attributeOptionId: string };
    await attributeOptionServices.toggleAttributeOptionSoftDeleteService(
      params.attributeOptionId,
    );

    return responseSuccess(
      reply,
      null,
      "AttributeOption Soft Delete Toggled Successfully!",
    );
  } catch (error: any) {
    throw error;
  }
};

// Toggle many attributeOption soft delete
const toggleManyAttributeOptionSoftDeleteController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const attributeOptionIds = req.body as string[];

    if (
      !attributeOptionIds ||
      !Array.isArray(attributeOptionIds) ||
      attributeOptionIds.length === 0
    ) {
      return responseError(
        reply,
        "Invalid or empty AttributeOption IDs array provided",
        500,
      );
    }
    const result =
      await attributeOptionServices.toggleManyAttributeOptionSoftDeleteService(
        attributeOptionIds,
      );

    return responseSuccess(
      reply,
      null,
      `Toggled Soft Delete for ${result.modifiedCount} AttributeOptions Successfully!`,
    );
  } catch (error: any) {
    throw error;
  }
};

// Recover attributeOption
const recoverAttributeOptionController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const attributeOptionIds = req.body as string[];

    if (
      !attributeOptionIds ||
      !Array.isArray(attributeOptionIds) ||
      attributeOptionIds.length === 0
    ) {
      return responseError(
        reply,
        "Invalid or empty AttributeOption IDs array provided",
        500,
      );
    }

    const result =
      await attributeOptionServices.recoverAttributeOptionService(
        attributeOptionIds,
      );

    return responseSuccess(
      reply,
      null,
      `Recovered ${result.modifiedCount} AttributeOptions Successfully!`,
    );
  } catch (error: any) {
    throw error;
  }
};

// Recover all attributeOption
const recoverAllAttributeOptionController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const result =
      await attributeOptionServices.recoverAllAttributeOptionService();

    return responseSuccess(
      reply,
      null,
      `Recovered ${result.modifiedCount} AttributeOptions Successfully!`,
    );
  } catch (error: any) {
    throw error;
  }
};

// Soft delete many attributeOptions
const softDeleteManyAttributeOptionController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const attributeOptionIds = req.body as string[];

    if (!Array.isArray(attributeOptionIds) || attributeOptionIds.length === 0) {
      return responseError(
        reply,
        "Invalid or empty AttributeOption IDs array provided",
        500,
      );
    }

    const result =
      await attributeOptionServices.softDeleteManyAttributeOptionsService(
        attributeOptionIds,
      );

    return responseSuccess(
      reply,
      null,
      `Soft Deleted ${result.modifiedCount} AttributeOptions Successfully!`,
    );
  } catch (error: any) {
    throw error;
  }
};

// Hard delete single attributeOption
const hardDeleteSingleAttributeOptionController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = req.params as { attributeOptionId: string };
    await attributeOptionServices.hardDeleteSingleAttributeOptionService(
      params.attributeOptionId,
    );

    return responseSuccess(
      reply,
      null,
      "AttributeOption Deleted Successfully!",
    );
  } catch (error: any) {
    throw error;
  }
};

// Hard delete many attributeOptions
const hardDeleteManyAttributeOptionController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const attributeOptionIds = req.body as string[];

    if (!Array.isArray(attributeOptionIds) || attributeOptionIds.length === 0) {
      return responseError(
        reply,
        "Invalid or empty AttributeOption IDs array provided",
        500,
      );
    }

    const result =
      await attributeOptionServices.hardDeleteManyAttributeOptionsService(
        attributeOptionIds,
      );

    return responseSuccess(
      reply,
      null,
      `Deleted ${result.deletedCount} AttributeOptions Successfully!`,
    );
  } catch (error: any) {
    throw error;
  }
};

export const attributeOptionControllers = {
  createAttributeOptionController,
  createBulkAttributeOptionsController,
  getAllAttributeOptionController,
  getSingleAttributeOptionController,
  updateSingleAttributeOptionController,
  toggleAttributeOptionStatusController,
  toggleManyAttributeOptionStatusController,
  softDeleteSingleAttributeOptionController,
  toggleAttributeOptionSoftDeleteController,
  toggleManyAttributeOptionSoftDeleteController,
  softDeleteManyAttributeOptionController,
  recoverAttributeOptionController,
  recoverAllAttributeOptionController,
  hardDeleteSingleAttributeOptionController,
  hardDeleteManyAttributeOptionController,
};
