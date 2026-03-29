import { FastifyInstance } from "fastify";
import { categoryControllers } from "./category.controller";
import { authorize } from "../../middlewares/authorize";
import { ModelNames, StandardActions } from "../../global/global.constants";

export const categoryRoutes = async (app: FastifyInstance) => {
  app.post(
    "/category/",
    { preHandler: authorize(ModelNames.CATEGORY, StandardActions.CREATE) },
    categoryControllers.createCategoryController,
  );

  app.post(
    "/category/bulk/",
    { preHandler: authorize(ModelNames.CATEGORY, StandardActions.CREATE) },
    categoryControllers.createBulkCategoriesController,
  );

  app.post(
    "/category/recover/",
    { preHandler: authorize(ModelNames.CATEGORY, StandardActions.RECOVER) },
    categoryControllers.recoverCategoryController,
  );

  app.post(
    "/category/recover/all/",
    { preHandler: authorize(ModelNames.CATEGORY, StandardActions.RECOVER) },
    categoryControllers.recoverAllCategoryController,
  );

  app.get(
    "/category/",
    { preHandler: authorize(ModelNames.CATEGORY, StandardActions.READ_MANY) },
    categoryControllers.getAllCategoryController,
  );

  app.get(
    "/category/nested/",
    { preHandler: authorize(ModelNames.CATEGORY, StandardActions.READ_MANY) },
    categoryControllers.getAllNestedCategoryController,
  );

  app.get(
    "/category/:categoryId/",
    { preHandler: authorize(ModelNames.CATEGORY, StandardActions.READ) },
    categoryControllers.getSingleCategoryController,
  );

  app.get(
    "/category/slug/:categorySlug/",
    { preHandler: authorize(ModelNames.CATEGORY, StandardActions.READ) },
    categoryControllers.getSingleCategoryBySlugController,
  );

  app.patch(
    "/category/:categoryId/",
    { preHandler: authorize(ModelNames.CATEGORY, StandardActions.UPDATE) },
    categoryControllers.updateSingleCategoryController,
  );

  app.patch(
    "/category/:categoryId/status/toggle/",
    { preHandler: authorize(ModelNames.CATEGORY, StandardActions.UPDATE) },
    categoryControllers.toggleCategoryStatusController,
  );

  app.patch(
    "/category/status/toggle/many/",
    { preHandler: authorize(ModelNames.CATEGORY, StandardActions.UPDATE) },
    categoryControllers.toggleManyCategoryStatusController,
  );

  app.patch(
    "/category/:categoryId/soft/",
    { preHandler: authorize(ModelNames.CATEGORY, StandardActions.SOFT_DELETE) },
    categoryControllers.softDeleteSingleCategoryController,
  );

  app.patch(
    "/category/:categoryId/soft/toggle/",
    { preHandler: authorize(ModelNames.CATEGORY, StandardActions.SOFT_DELETE) },
    categoryControllers.toggleCategorySoftDeleteController,
  );

  app.patch(
    "/category/soft/toggle/many/",
    {
      preHandler: authorize(
        ModelNames.CATEGORY,
        StandardActions.SOFT_DELETE_MANY,
      ),
    },
    categoryControllers.toggleManyCategorySoftDeleteController,
  );

  app.patch(
    "/category/bulk/soft/",
    {
      preHandler: authorize(
        ModelNames.CATEGORY,
        StandardActions.SOFT_DELETE_MANY,
      ),
    },
    categoryControllers.softDeleteManyCategoryController,
  );

  app.delete(
    "/category/:categoryId/",
    { preHandler: authorize(ModelNames.CATEGORY, StandardActions.HARD_DELETE) },
    categoryControllers.hardDeleteSingleCategoryController,
  );

  app.delete(
    "/category/bulk/",
    {
      preHandler: authorize(
        ModelNames.CATEGORY,
        StandardActions.HARD_DELETE_MANY,
      ),
    },
    categoryControllers.hardDeleteManyCategoryController,
  );
};
