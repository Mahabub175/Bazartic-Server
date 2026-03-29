import { FastifyRequest, FastifyReply } from "fastify";
import { categoryServices } from "./category.service";
import { responseError, responseSuccess } from "../../utils/response";
import { ICategory } from "./category.interface";
import {
  parseMultipartBody,
  parseQueryFilters,
} from "../../utils/parsedBodyData";
import { uploadService } from "../upload/upload.service";

// Create a category
const createCategoryController = async (
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

    const result = await categoryServices.createCategoryService(
      formData as ICategory,
    );

    return responseSuccess(reply, result, "Category Created Successfully");
  } catch (error: any) {
    throw error;
  }
};

// Create bulk categories
const createBulkCategoriesController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const categories = parseMultipartBody(req.body as Record<string, any>);

    if (!Array.isArray(categories) || !categories.length) {
      return responseError(reply, "No categories provided", 400);
    }

    const createdCategories =
      await categoryServices.createBulkCategoriesService(categories);

    return responseSuccess(
      reply,
      createdCategories,
      `${createdCategories.length} categories created successfully`,
    );
  } catch (err: any) {
    return responseError(
      reply,
      err.message || "Failed to create categories",
      500,
      err,
    );
  }
};

// Get all categories
const getAllCategoryController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const searchFields = ["name"];

    const { filters, searchText } = parseQueryFilters(
      req.query as Record<string, any>,
    );

    const result = await categoryServices.getAllCategoryService(
      searchFields,
      searchText,
      filters,
    );

    return responseSuccess(reply, result, "Categories Fetched Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Get all nested categories
const getAllNestedCategoryController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const searchFields = ["name"];

    const { filters, searchText } = parseQueryFilters(
      req.query as Record<string, any>,
    );

    const result = await categoryServices.getAllNestedCategoryService(
      searchFields,
      searchText,
      filters,
    );

    return responseSuccess(reply, result, "Categories Fetched Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Get single category by ID
const getSingleCategoryController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = req.params as { categoryId: string };
    const result = await categoryServices.getSingleCategoryService(
      params.categoryId,
    );

    return responseSuccess(reply, result, "Category Fetched Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Get single category by slug
const getSingleCategoryBySlugController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = req.params as { categorySlug: string };
    const result = await categoryServices.getSingleCategoryBySlugService(
      params.categorySlug,
    );

    return responseSuccess(
      reply,
      result,
      "Category by Slug Fetched Successfully!",
    );
  } catch (error: any) {
    throw error;
  }
};

// Update single category
const updateSingleCategoryController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = req.params as { categoryId: string };
    const data = parseMultipartBody(req.body as Record<string, any>);
    const categoryData: Partial<ICategory> = { ...data };

    const attachmentPath = await uploadService(req, "attachment");
    if (attachmentPath && typeof attachmentPath === "string") {
      categoryData.attachment = attachmentPath;
    }

    const result = await categoryServices.updateSingleCategoryService(
      params.categoryId,
      categoryData as ICategory,
    );

    return responseSuccess(reply, result, "Category Updated Successfully!");
  } catch (error: any) {
    console.error("Update category error:", error);
    throw error;
  }
};

// Toggle category status
const toggleCategoryStatusController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = req.params as { categoryId: string };
    await categoryServices.toggleCategoryStatusService(params.categoryId);

    return responseSuccess(
      reply,
      null,
      "Category Status Toggled Successfully!",
    );
  } catch (error: any) {
    throw error;
  }
};

// Toggle many category status
const toggleManyCategoryStatusController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const categoryIds = req.body as string[];

    if (
      !categoryIds ||
      !Array.isArray(categoryIds) ||
      categoryIds.length === 0
    ) {
      return responseError(
        reply,
        "Invalid or empty Category IDs array provided",
        500,
      );
    }

    const result =
      await categoryServices.toggleManyCategoryStatusService(categoryIds);

    return responseSuccess(
      reply,
      null,
      `Toggled Status for ${result.modifiedCount} Categories Successfully! `,
    );
  } catch (error: any) {
    throw error;
  }
};

// Soft delete single category
const softDeleteSingleCategoryController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = req.params as { categoryId: string };
    await categoryServices.softDeleteSingleCategoryService(params.categoryId);

    return responseSuccess(reply, null, "Category Soft Deleted Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Toggle category soft delete
const toggleCategorySoftDeleteController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = req.params as { categoryId: string };
    await categoryServices.toggleCategorySoftDeleteService(params.categoryId);

    return responseSuccess(
      reply,
      null,
      "Category Soft Delete Toggled Successfully!",
    );
  } catch (error: any) {
    throw error;
  }
};

// Toggle many category soft delete
const toggleManyCategorySoftDeleteController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const categoryIds = req.body as string[];

    if (
      !categoryIds ||
      !Array.isArray(categoryIds) ||
      categoryIds.length === 0
    ) {
      return responseError(
        reply,
        "Invalid or empty Category IDs array provided",
        500,
      );
    }
    const result =
      await categoryServices.toggleManyCategorySoftDeleteService(categoryIds);

    return responseSuccess(
      reply,
      null,
      `Toggled Soft Delete for ${result.modifiedCount} Categories Successfully!`,
    );
  } catch (error: any) {
    throw error;
  }
};

// Recover category
const recoverCategoryController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const categoryIds = req.body as string[];

    if (
      !categoryIds ||
      !Array.isArray(categoryIds) ||
      categoryIds.length === 0
    ) {
      return responseError(
        reply,
        "Invalid or empty Category IDs array provided",
        500,
      );
    }

    const result = await categoryServices.recoverCategoryService(categoryIds);

    return responseSuccess(
      reply,
      null,
      `Recovered ${result.modifiedCount} Categories Successfully!`,
    );
  } catch (error: any) {
    throw error;
  }
};

// Recover all category
const recoverAllCategoryController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const result = await categoryServices.recoverAllCategoryService();

    return responseSuccess(
      reply,
      null,
      `Recovered ${result.modifiedCount} Categories Successfully!`,
    );
  } catch (error: any) {
    throw error;
  }
};

// Soft delete many categories
const softDeleteManyCategoryController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const categoryIds = req.body as string[];

    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
      return responseError(
        reply,
        "Invalid or empty Category IDs array provided",
        500,
      );
    }

    const result =
      await categoryServices.softDeleteManyCategoriesService(categoryIds);

    return responseSuccess(
      reply,
      null,
      `Soft Deleted ${result.modifiedCount} Categories Successfully!`,
    );
  } catch (error: any) {
    throw error;
  }
};

// Hard delete single category
const hardDeleteSingleCategoryController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = req.params as { categoryId: string };
    await categoryServices.hardDeleteSingleCategoryService(params.categoryId);

    return responseSuccess(reply, null, "Category Deleted Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Hard delete many categories
const hardDeleteManyCategoryController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const categoryIds = req.body as string[];

    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
      return responseError(
        reply,
        "Invalid or empty Category IDs array provided",
        500,
      );
    }

    const result =
      await categoryServices.hardDeleteManyCategoriesService(categoryIds);

    return responseSuccess(
      reply,
      null,
      `Deleted ${result.deletedCount} Categories Successfully!`,
    );
  } catch (error: any) {
    throw error;
  }
};

export const categoryControllers = {
  createCategoryController,
  createBulkCategoriesController,
  getAllCategoryController,
  getAllNestedCategoryController,
  getSingleCategoryController,
  getSingleCategoryBySlugController,
  updateSingleCategoryController,
  toggleCategoryStatusController,
  toggleManyCategoryStatusController,
  softDeleteSingleCategoryController,
  toggleCategorySoftDeleteController,
  toggleManyCategorySoftDeleteController,
  softDeleteManyCategoryController,
  recoverCategoryController,
  recoverAllCategoryController,
  hardDeleteSingleCategoryController,
  hardDeleteManyCategoryController,
};
