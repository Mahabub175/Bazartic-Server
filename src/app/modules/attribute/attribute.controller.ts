import { FastifyRequest, FastifyReply } from "fastify";
import { attributeServices } from "./attribute.service";
import { responseError, responseSuccess } from "../../utils/response";
import { IAttribute } from "./attribute.interface";
import {
  parseMultipartBody,
  parseQueryFilters,
} from "../../utils/parsedBodyData";

// Create a attribute
const createAttributeController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const data = parseMultipartBody(req.body as Record<string, any>);

    const formData = {
      ...data,
    };

    const result = await attributeServices.createAttributeService(
      formData as IAttribute,
    );

    return responseSuccess(reply, result, "Attribute Created Successfully");
  } catch (error: any) {
    throw error;
  }
};

// Create bulk attributes
const createBulkAttributesController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const attributes = parseMultipartBody(req.body as Record<string, any>);

    if (!Array.isArray(attributes) || !attributes.length) {
      return responseError(reply, "No attributes provided", 400);
    }

    const createdAttributes =
      await attributeServices.createBulkAttributesService(attributes);

    return responseSuccess(
      reply,
      createdAttributes,
      `${createdAttributes.length} attributes created successfully`,
    );
  } catch (err: any) {
    return responseError(
      reply,
      err.message || "Failed to create attributes",
      500,
      err,
    );
  }
};

// Get all attributes
const getAllAttributeController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const searchFields = ["name"];

    const { filters, searchText } = parseQueryFilters(
      req.query as Record<string, any>,
    );

    const result = await attributeServices.getAllAttributeService(
      searchFields,
      searchText,
      filters,
    );

    return responseSuccess(reply, result, "Attributes Fetched Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Get single attribute by ID
const getSingleAttributeController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = req.params as { attributeId: string };
    const result = await attributeServices.getSingleAttributeService(
      params.attributeId,
    );

    return responseSuccess(reply, result, "Attribute Fetched Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Update single attribute
const updateSingleAttributeController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = req.params as { attributeId: string };
    const data = parseMultipartBody(req.body as Record<string, any>);
    const attributeData: Partial<IAttribute> = { ...data };

    const result = await attributeServices.updateSingleAttributeService(
      params.attributeId,
      attributeData as IAttribute,
    );

    return responseSuccess(reply, result, "Attribute Updated Successfully!");
  } catch (error: any) {
    console.error("Update attribute error:", error);
    throw error;
  }
};

// Toggle attribute status
const toggleAttributeStatusController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = req.params as { attributeId: string };
    await attributeServices.toggleAttributeStatusService(params.attributeId);

    return responseSuccess(
      reply,
      null,
      "Attribute Status Toggled Successfully!",
    );
  } catch (error: any) {
    throw error;
  }
};

// Toggle many attribute status
const toggleManyAttributeStatusController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const attributeIds = req.body as string[];

    if (
      !attributeIds ||
      !Array.isArray(attributeIds) ||
      attributeIds.length === 0
    ) {
      return responseError(
        reply,
        "Invalid or empty Attribute IDs array provided",
        500,
      );
    }

    const result =
      await attributeServices.toggleManyAttributeStatusService(attributeIds);

    return responseSuccess(
      reply,
      null,
      `Toggled Status for ${result.modifiedCount} Attributes Successfully! `,
    );
  } catch (error: any) {
    throw error;
  }
};

// Soft delete single attribute
const softDeleteSingleAttributeController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = req.params as { attributeId: string };
    await attributeServices.softDeleteSingleAttributeService(
      params.attributeId,
    );

    return responseSuccess(reply, null, "Attribute Soft Deleted Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Toggle attribute soft delete
const toggleAttributeSoftDeleteController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = req.params as { attributeId: string };
    await attributeServices.toggleAttributeSoftDeleteService(
      params.attributeId,
    );

    return responseSuccess(
      reply,
      null,
      "Attribute Soft Delete Toggled Successfully!",
    );
  } catch (error: any) {
    throw error;
  }
};

// Toggle many attribute soft delete
const toggleManyAttributeSoftDeleteController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const attributeIds = req.body as string[];

    if (
      !attributeIds ||
      !Array.isArray(attributeIds) ||
      attributeIds.length === 0
    ) {
      return responseError(
        reply,
        "Invalid or empty Attribute IDs array provided",
        500,
      );
    }
    const result =
      await attributeServices.toggleManyAttributeSoftDeleteService(
        attributeIds,
      );

    return responseSuccess(
      reply,
      null,
      `Toggled Soft Delete for ${result.modifiedCount} Attributes Successfully!`,
    );
  } catch (error: any) {
    throw error;
  }
};

// Recover attribute
const recoverAttributeController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const attributeIds = req.body as string[];

    if (
      !attributeIds ||
      !Array.isArray(attributeIds) ||
      attributeIds.length === 0
    ) {
      return responseError(
        reply,
        "Invalid or empty Attribute IDs array provided",
        500,
      );
    }

    const result =
      await attributeServices.recoverAttributeService(attributeIds);

    return responseSuccess(
      reply,
      null,
      `Recovered ${result.modifiedCount} Attributes Successfully!`,
    );
  } catch (error: any) {
    throw error;
  }
};

// Recover all attribute
const recoverAllAttributeController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const result = await attributeServices.recoverAllAttributeService();

    return responseSuccess(
      reply,
      null,
      `Recovered ${result.modifiedCount} Attributes Successfully!`,
    );
  } catch (error: any) {
    throw error;
  }
};

// Soft delete many attributes
const softDeleteManyAttributeController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const attributeIds = req.body as string[];

    if (!Array.isArray(attributeIds) || attributeIds.length === 0) {
      return responseError(
        reply,
        "Invalid or empty Attribute IDs array provided",
        500,
      );
    }

    const result =
      await attributeServices.softDeleteManyAttributesService(attributeIds);

    return responseSuccess(
      reply,
      null,
      `Soft Deleted ${result.modifiedCount} Attributes Successfully!`,
    );
  } catch (error: any) {
    throw error;
  }
};

// Hard delete single attribute
const hardDeleteSingleAttributeController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = req.params as { attributeId: string };
    await attributeServices.hardDeleteSingleAttributeService(
      params.attributeId,
    );

    return responseSuccess(reply, null, "Attribute Deleted Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Hard delete many attributes
const hardDeleteManyAttributeController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const attributeIds = req.body as string[];

    if (!Array.isArray(attributeIds) || attributeIds.length === 0) {
      return responseError(
        reply,
        "Invalid or empty Attribute IDs array provided",
        500,
      );
    }

    const result =
      await attributeServices.hardDeleteManyAttributesService(attributeIds);

    return responseSuccess(
      reply,
      null,
      `Deleted ${result.deletedCount} Attributes Successfully!`,
    );
  } catch (error: any) {
    throw error;
  }
};

export const attributeControllers = {
  createAttributeController,
  createBulkAttributesController,
  getAllAttributeController,
  getSingleAttributeController,
  updateSingleAttributeController,
  toggleAttributeStatusController,
  toggleManyAttributeStatusController,
  softDeleteSingleAttributeController,
  toggleAttributeSoftDeleteController,
  toggleManyAttributeSoftDeleteController,
  softDeleteManyAttributeController,
  recoverAttributeController,
  recoverAllAttributeController,
  hardDeleteSingleAttributeController,
  hardDeleteManyAttributeController,
};
