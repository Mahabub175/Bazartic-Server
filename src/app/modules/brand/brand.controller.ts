import { FastifyRequest, FastifyReply } from "fastify";
import { brandServices } from "./brand.service";
import { responseError, responseSuccess } from "../../utils/response";
import { IBrand } from "./brand.interface";
import {
  parseMultipartBody,
  parseQueryFilters,
} from "../../utils/parsedBodyData";
import { uploadService } from "../upload/upload.service";

// Create a brand
const createBrandController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const data = parseMultipartBody(req.body as Record<string, any>);

    const attachmentPath = await uploadService(req, "attachment");
    const imagesPath = await uploadService(req, "images");

    const images = Array.isArray(imagesPath)
      ? imagesPath
      : imagesPath
        ? [imagesPath]
        : [];

    const formData = {
      ...data,
      ...(attachmentPath ? { attachment: attachmentPath } : {}),
      ...(images.length ? { images } : {}),
    };

    const result = await brandServices.createBrandService(formData as IBrand);

    return responseSuccess(reply, result, "Brand Created Successfully");
  } catch (error: any) {
    throw error;
  }
};

// Create bulk brands
const createBulkBrandsController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const brands = parseMultipartBody(req.body as Record<string, any>);

    if (!Array.isArray(brands) || !brands.length) {
      return responseError(reply, "No brands provided", 400);
    }

    const createdBrands = await brandServices.createBulkBrandsService(brands);

    return responseSuccess(
      reply,
      createdBrands,
      `${createdBrands.length} brands created successfully`,
    );
  } catch (err: any) {
    return responseError(
      reply,
      err.message || "Failed to create brands",
      500,
      err,
    );
  }
};

// Get all brands
const getAllBrandController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const searchFields = ["name"];

    const { filters, searchText } = parseQueryFilters(
      req.query as Record<string, any>,
    );

    const result = await brandServices.getAllBrandService(
      searchFields,
      searchText,
      filters,
    );

    return responseSuccess(reply, result, "Brands Fetched Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Get single brand by ID
const getSingleBrandController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = req.params as { brandId: string };
    const result = await brandServices.getSingleBrandService(params.brandId);

    return responseSuccess(reply, result, "Brand Fetched Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Get single brand by slug
const getSingleBrandBySlugController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = req.params as { brandSlug: string };
    const result = await brandServices.getSingleBrandBySlugService(
      params.brandSlug,
    );

    return responseSuccess(
      reply,
      result,
      "Brand by Slug Fetched Successfully!",
    );
  } catch (error: any) {
    throw error;
  }
};

// Update single brand
const updateSingleBrandController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = req.params as { brandId: string };
    const data = parseMultipartBody(req.body as Record<string, any>);
    const brandData: Partial<IBrand> = { ...data };

    const attachmentPath = await uploadService(req, "attachment");
    if (attachmentPath && typeof attachmentPath === "string") {
      brandData.attachment = attachmentPath;
    }

    if (
      data.images === undefined ||
      (Array.isArray(data.images) && !data.images.length)
    ) {
      delete data.images;
    }

    const imageResult = await uploadService(req, "images");
    const images = Array.isArray(imageResult)
      ? imageResult
      : imageResult
        ? [imageResult]
        : [];

    const result = await brandServices.updateSingleBrandService(
      params.brandId,
      brandData as IBrand,
    );

    return responseSuccess(reply, result, "Brand Updated Successfully!");
  } catch (error: any) {
    console.error("Update brand error:", error);
    throw error;
  }
};

// Toggle brand status
const toggleBrandStatusController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = req.params as { brandId: string };
    await brandServices.toggleBrandStatusService(params.brandId);

    return responseSuccess(reply, null, "Brand Status Toggled Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Toggle many brand status
const toggleManyBrandStatusController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const brandIds = req.body as string[];

    if (!brandIds || !Array.isArray(brandIds) || brandIds.length === 0) {
      return responseError(
        reply,
        "Invalid or empty Brand IDs array provided",
        500,
      );
    }

    const result = await brandServices.toggleManyBrandStatusService(brandIds);

    return responseSuccess(
      reply,
      null,
      `Toggled Status for ${result.modifiedCount} Brands Successfully! `,
    );
  } catch (error: any) {
    throw error;
  }
};

// Soft delete single brand
const softDeleteSingleBrandController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = req.params as { brandId: string };
    await brandServices.softDeleteSingleBrandService(params.brandId);

    return responseSuccess(reply, null, "Brand Soft Deleted Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Toggle brand soft delete
const toggleBrandSoftDeleteController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = req.params as { brandId: string };
    await brandServices.toggleBrandSoftDeleteService(params.brandId);

    return responseSuccess(
      reply,
      null,
      "Brand Soft Delete Toggled Successfully!",
    );
  } catch (error: any) {
    throw error;
  }
};

// Toggle many brand soft delete
const toggleManyBrandSoftDeleteController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const brandIds = req.body as string[];

    if (!brandIds || !Array.isArray(brandIds) || brandIds.length === 0) {
      return responseError(
        reply,
        "Invalid or empty Brand IDs array provided",
        500,
      );
    }
    const result =
      await brandServices.toggleManyBrandSoftDeleteService(brandIds);

    return responseSuccess(
      reply,
      null,
      `Toggled Soft Delete for ${result.modifiedCount} Brands Successfully!`,
    );
  } catch (error: any) {
    throw error;
  }
};

// Recover brand
const recoverBrandController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const brandIds = req.body as string[];

    if (!brandIds || !Array.isArray(brandIds) || brandIds.length === 0) {
      return responseError(
        reply,
        "Invalid or empty Brand IDs array provided",
        500,
      );
    }

    const result = await brandServices.recoverBrandService(brandIds);

    return responseSuccess(
      reply,
      null,
      `Recovered ${result.modifiedCount} Brands Successfully!`,
    );
  } catch (error: any) {
    throw error;
  }
};

// Recover all brand
const recoverAllBrandController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const result = await brandServices.recoverAllBrandService();

    return responseSuccess(
      reply,
      null,
      `Recovered ${result.modifiedCount} Brands Successfully!`,
    );
  } catch (error: any) {
    throw error;
  }
};

// Soft delete many brands
const softDeleteManyBrandController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const brandIds = req.body as string[];

    if (!Array.isArray(brandIds) || brandIds.length === 0) {
      return responseError(
        reply,
        "Invalid or empty Brand IDs array provided",
        500,
      );
    }

    const result = await brandServices.softDeleteManyBrandsService(brandIds);

    return responseSuccess(
      reply,
      null,
      `Soft Deleted ${result.modifiedCount} Brands Successfully!`,
    );
  } catch (error: any) {
    throw error;
  }
};

// Hard delete single brand
const hardDeleteSingleBrandController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const params = req.params as { brandId: string };
    await brandServices.hardDeleteSingleBrandService(params.brandId);

    return responseSuccess(reply, null, "Brand Deleted Successfully!");
  } catch (error: any) {
    throw error;
  }
};

// Hard delete many brands
const hardDeleteManyBrandController = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const brandIds = req.body as string[];

    if (!Array.isArray(brandIds) || brandIds.length === 0) {
      return responseError(
        reply,
        "Invalid or empty Brand IDs array provided",
        500,
      );
    }

    const result = await brandServices.hardDeleteManyBrandsService(brandIds);

    return responseSuccess(
      reply,
      null,
      `Deleted ${result.deletedCount} Brands Successfully!`,
    );
  } catch (error: any) {
    throw error;
  }
};

export const brandControllers = {
  createBrandController,
  createBulkBrandsController,
  getAllBrandController,
  getSingleBrandController,
  getSingleBrandBySlugController,
  updateSingleBrandController,
  toggleBrandStatusController,
  toggleManyBrandStatusController,
  softDeleteSingleBrandController,
  toggleBrandSoftDeleteController,
  toggleManyBrandSoftDeleteController,
  softDeleteManyBrandController,
  recoverBrandController,
  recoverAllBrandController,
  hardDeleteSingleBrandController,
  hardDeleteManyBrandController,
};
