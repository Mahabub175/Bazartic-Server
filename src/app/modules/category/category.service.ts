import { Types } from "mongoose";
import { ICategory } from "./category.interface";
import { categoryModel } from "./category.model";
import { paginateAndSort } from "../../utils/paginateAndSort";
import { throwError } from "../../utils/response";
import { deleteFileSync } from "../../utils/deleteFilesFromStorage";
import { cleanObject } from "../../utils/cleanObject";
import { formatResultData } from "../../utils/formatResultData";

const validateParent = async (
  parentId: Types.ObjectId,
  expectedChildLevel: ICategory["level"],
  session?: any,
) => {
  const levelMap: Record<string, ICategory["level"]> = {
    parentCategory: "category",
    category: "subCategory",
  };

  const parent = await categoryModel
    .findOne({ _id: parentId, isDeleted: false })
    .select("level")
    .session(session ?? null)
    .lean();

  if (!parent) throw new Error("Parent category not found");

  if (levelMap[parent.level] !== expectedChildLevel) {
    throw new Error(
      `A "${expectedChildLevel}" must be placed under a "${Object.keys(
        levelMap,
      ).find((k) => levelMap[k] === expectedChildLevel)}"`,
    );
  }
};

export const createCategoryService = async (
  categoryData: Partial<ICategory> & { parentId?: Types.ObjectId },
) => {
  const { parentId, ...data } = categoryData;

  if (parentId) {
    await validateParent(parentId, data.level as ICategory["level"]);
  }

  return categoryModel.create({
    ...data,
    parent: parentId ?? null,
  });
};

export const createBulkCategoriesService = async (
  categories: (Partial<ICategory> & { parentId?: Types.ObjectId })[],
) => {
  if (!categories.length) throw new Error("No categories provided");

  const session = await categoryModel.startSession();

  try {
    const result = await session.withTransaction(async () => {
      const roots = categories.filter(
        (c) => c.level === "parentCategory" || !c.parentId,
      );
      const children = categories.filter(
        (c) => c.level !== "parentCategory" && c.parentId,
      );

      const createdRoots = await categoryModel.insertMany(
        roots.map(({ parentId, ...data }) => ({ ...data, parent: null })),
        { session },
      );

      if (!children.length) return createdRoots;

      const parentIds = [
        ...new Set(children.map((c) => c.parentId!.toString())),
      ];

      const parentDocs = await categoryModel
        .find({ _id: { $in: parentIds }, isDeleted: false })
        .select("_id level")
        .session(session)
        .lean();

      const parentMap = new Map(parentDocs.map((p) => [p._id.toString(), p]));

      const levelMap: Record<string, ICategory["level"]> = {
        parentCategory: "category",
        category: "subCategory",
      };

      const childDocs = children.map(({ parentId, ...data }) => {
        const parent = parentMap.get(parentId!.toString());
        if (!parent) throw new Error(`Parent not found for: ${data.name}`);

        if (levelMap[parent.level] !== data.level) {
          throw new Error(
            `"${data.name}" (${data.level}) cannot be placed under a "${parent.level}"`,
          );
        }

        return { ...data, parent: parentId };
      });

      const createdChildren = await categoryModel.insertMany(childDocs, {
        session,
      });

      return [...createdRoots, ...createdChildren];
    });

    return result;
  } finally {
    session.endSession();
  }
};

// Get all categories with optional pagination & search
const getAllCategoryService = async (
  searchFields: string[],
  searchText?: string,
  filters?: Record<string, any>,
) => {
  const query = categoryModel.find();

  return paginateAndSort(query, {
    searchFields,
    searchText,
    filters,
  });
};

const getAllNestedCategoryService = async (
  searchFields: string[],
  searchText?: string,
  filters?: Record<string, any>,
) => {
  const query = categoryModel.find({ parent: null, isDeleted: false });

  const paginated = await paginateAndSort(query, {
    searchFields,
    searchText,
    filters,
  });

  const rootIds = paginated.results.map((r: any) => r._id);

  const allChildren = await categoryModel
    .find({ parent: { $in: rootIds }, isDeleted: false })
    .lean();

  const allSubChildren = await categoryModel
    .find({
      parent: { $in: allChildren.map((c) => c._id) },
      isDeleted: false,
    })
    .lean();

  const subMap = new Map<string, any[]>();
  for (const sub of allSubChildren) {
    if (!sub.parent) continue;
    const key = sub.parent.toString();
    if (!subMap.has(key)) subMap.set(key, []);
    subMap.get(key)!.push(sub);
  }

  const childMap = new Map<string, any[]>();
  for (const child of allChildren) {
    if (!child.parent) continue;
    const key = child.parent.toString();
    if (!childMap.has(key)) childMap.set(key, []);
    childMap.get(key)!.push({
      ...child,
      children: subMap.get(child._id.toString()) ?? [],
    });
  }

  const results = paginated.results.map((root: any) =>
    formatResultData({
      ...root,
      children: childMap.get(root._id.toString()) ?? [],
    }),
  );

  return {
    ...paginated,
    results,
  };
};

// Get single category by ID
const getSingleCategoryService = async (categoryId: string) => {
  const queryId =
    typeof categoryId === "string"
      ? new Types.ObjectId(categoryId)
      : categoryId;

  const query = categoryModel.find({ _id: queryId });

  const result = await paginateAndSort<ICategory>(query);

  if (!result.results || !result.results.length)
    throwError("Category not found", 404);

  return result.results[0];
};

// Get single category by slug
const getSingleCategoryBySlugService = async (slug: string) => {
  const query = categoryModel.find({ slug });

  const result = await paginateAndSort<ICategory>(query);

  if (!result.results || !result.results.length)
    throwError("Category not found!", 404);

  return result.results[0];
};

// Update single category
const updateSingleCategoryService = async (
  categoryId: string | number,
  categoryData: Partial<ICategory>,
) => {
  const queryId =
    typeof categoryId === "string"
      ? new Types.ObjectId(categoryId)
      : categoryId;

  const category = await categoryModel.findById(queryId).exec();
  if (!category) throwError("Category not found", 404);
  else {
    categoryData = cleanObject(categoryData);

    if (
      categoryData.attachment &&
      category.attachment &&
      categoryData.attachment !== category.attachment
    ) {
      deleteFileSync(category.attachment);
    }

    const updated = await categoryModel
      .findByIdAndUpdate(
        queryId,
        { $set: categoryData },
        { new: true, runValidators: true, context: "query" },
      )
      .exec();

    if (!updated) throwError("Category update failed", 500);

    return updated;
  }
};

// Toggle category status
const toggleCategoryStatusService = async (categoryId: string) => {
  if (!Types.ObjectId.isValid(categoryId)) {
    throwError("Invalid category ID", 400);
  }

  const category = await categoryModel.findOne({
    _id: categoryId,
    isDeleted: { $ne: true },
  });

  if (!category) throwError("Category not found or already deleted", 404);
  else {
    category.status = !category.status;
    await category.save();

    return category.toObject();
  }
};

// Toggle multiple category status
const toggleManyCategoryStatusService = async (categoryIds: string[]) => {
  const validIds = categoryIds.filter((id) => Types.ObjectId.isValid(id));
  if (!validIds.length) throwError("No valid category IDs provided!", 400);

  const result = await categoryModel.updateMany(
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
    throwError("No categories found or all are deleted!", 404);

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
  };
};

// Soft delete single category
const softDeleteSingleCategoryService = async (categoryId: string | number) => {
  const queryId =
    typeof categoryId === "string"
      ? new Types.ObjectId(categoryId)
      : categoryId;

  const category = await categoryModel.findById(queryId).exec();
  if (!category) throwError("Category not found", 404);
  else {
    if (category.isDeleted) throwError("Category already soft deleted!", 400);

    const softDeleted = await categoryModel
      .findByIdAndUpdate(queryId, { $set: { isDeleted: true } }, { new: true })
      .exec();

    if (!softDeleted) throwError("Category soft delete failed!", 500);

    return softDeleted;
  }
};

// Toggle category soft delete
const toggleCategorySoftDeleteService = async (categoryId: string) => {
  if (!Types.ObjectId.isValid(categoryId)) {
    throwError("Invalid category ID", 400);
  }

  const category = await categoryModel.findOne({
    _id: categoryId,
  });

  if (!category) throwError("Category not found!", 404);
  else {
    category.isDeleted = !category.isDeleted;
    await category.save();

    return category.toObject();
  }
};

// Toggle Soft delete multiple categories
const toggleManyCategorySoftDeleteService = async (categoryIds: string[]) => {
  const validIds = categoryIds.filter((id) => Types.ObjectId.isValid(id));
  if (!validIds.length) throwError("No valid category IDs provided!", 400);

  const result = await categoryModel.updateMany(
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
    throwError("No categories found!", 404);
  }

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
  };
};

// Recover category
const recoverCategoryService = async (categoryIds: string[]) => {
  if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
    throw new Error("No category IDs provided");
  }

  const validIds = categoryIds.filter((id) => Types.ObjectId.isValid(id));
  if (validIds.length === 0) {
    throw new Error("No valid category IDs provided");
  }

  const result = await categoryModel.updateMany(
    { _id: { $in: validIds } },
    { $set: { isDeleted: false } },
  );

  return {
    modifiedCount: result.modifiedCount,
    matchedCount: result.matchedCount,
  };
};

// Recover all category
const recoverAllCategoryService = async () => {
  const result = await categoryModel.updateMany(
    { isDeleted: true },
    { $set: { isDeleted: false } },
  );

  return {
    modifiedCount: result.modifiedCount,
    matchedCount: result.matchedCount,
  };
};

// Soft delete many categories
const softDeleteManyCategoriesService = async (
  categoryIds: (string | number)[],
) => {
  if (!categoryIds || !categoryIds.length)
    throwError("No category IDs provided", 400);

  const queryIds = categoryIds.map((id) =>
    typeof id === "string" && Types.ObjectId.isValid(id)
      ? new Types.ObjectId(id)
      : typeof id === "number"
        ? id
        : throwError(`Invalid category ID: ${id}`, 400),
  );

  const result = await categoryModel.updateMany(
    { _id: { $in: queryIds }, isDeleted: false },
    { $set: { isDeleted: true } },
  );

  if (!result.modifiedCount) throwError("No categories were soft deleted", 404);

  return result;
};

// Hard delete single category
const hardDeleteSingleCategoryService = async (categoryId: string | number) => {
  const queryId =
    typeof categoryId === "string"
      ? new Types.ObjectId(categoryId)
      : categoryId;

  const category = await categoryModel.findById(queryId).exec();
  if (!category) throwError("Category not found", 404);
  else {
    if (category.attachment) {
      deleteFileSync(category.attachment);
    }

    const deleted = await categoryModel.findByIdAndDelete(queryId).exec();
    if (!deleted) throwError("Category delete failed", 500);

    return deleted;
  }
};

// Hard delete many categories
const hardDeleteManyCategoriesService = async (
  categoryIds: (string | number)[],
) => {
  const queryIds = categoryIds.map((id) => {
    if (typeof id === "string" && Types.ObjectId.isValid(id))
      return new Types.ObjectId(id);
    else if (typeof id === "number") return id;
    else throwError(`Invalid ID format: ${id}`, 400);
  });

  const categories = await categoryModel
    .find({ _id: { $in: queryIds } })
    .exec();

  for (const category of categories) {
    if (category?.attachment) {
      deleteFileSync(category.attachment);
    }
  }

  const result = await categoryModel
    .deleteMany({ _id: { $in: queryIds } })
    .exec();
  return result;
};

export const categoryServices = {
  createCategoryService,
  updateSingleCategoryService,
  getAllCategoryService,
  getAllNestedCategoryService,
  getSingleCategoryService,
  getSingleCategoryBySlugService,
  createBulkCategoriesService,
  toggleCategoryStatusService,
  toggleManyCategoryStatusService,
  softDeleteSingleCategoryService,
  toggleCategorySoftDeleteService,
  toggleManyCategorySoftDeleteService,
  softDeleteManyCategoriesService,
  recoverCategoryService,
  recoverAllCategoryService,
  hardDeleteSingleCategoryService,
  hardDeleteManyCategoriesService,
};
