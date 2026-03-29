import { FastifyInstance } from "fastify";
import { brandControllers } from "./brand.controller";
import { authorize } from "../../middlewares/authorize";
import { ModelNames, StandardActions } from "../../global/global.constants";

export const brandRoutes = async (app: FastifyInstance) => {
  app.post(
    "/brand/",
    { preHandler: authorize(ModelNames.BRAND, StandardActions.CREATE) },
    brandControllers.createBrandController,
  );

  app.post(
    "/brand/bulk/",
    { preHandler: authorize(ModelNames.BRAND, StandardActions.CREATE) },
    brandControllers.createBulkBrandsController,
  );

  app.post(
    "/brand/recover/",
    { preHandler: authorize(ModelNames.BRAND, StandardActions.RECOVER) },
    brandControllers.recoverBrandController,
  );

  app.post(
    "/brand/recover/all/",
    { preHandler: authorize(ModelNames.BRAND, StandardActions.RECOVER) },
    brandControllers.recoverAllBrandController,
  );

  app.get(
    "/brand/",
    { preHandler: authorize(ModelNames.BRAND, StandardActions.READ_MANY) },
    brandControllers.getAllBrandController,
  );

  app.get(
    "/brand/:brandId/",
    { preHandler: authorize(ModelNames.BRAND, StandardActions.READ) },
    brandControllers.getSingleBrandController,
  );

  app.get(
    "/brand/slug/:brandSlug/",
    { preHandler: authorize(ModelNames.BRAND, StandardActions.READ) },
    brandControllers.getSingleBrandBySlugController,
  );

  app.patch(
    "/brand/:brandId/",
    { preHandler: authorize(ModelNames.BRAND, StandardActions.UPDATE) },
    brandControllers.updateSingleBrandController,
  );

  app.patch(
    "/brand/:brandId/status/toggle/",
    { preHandler: authorize(ModelNames.BRAND, StandardActions.UPDATE) },
    brandControllers.toggleBrandStatusController,
  );

  app.patch(
    "/brand/status/toggle/many/",
    { preHandler: authorize(ModelNames.BRAND, StandardActions.UPDATE) },
    brandControllers.toggleManyBrandStatusController,
  );

  app.patch(
    "/brand/:brandId/soft/",
    { preHandler: authorize(ModelNames.BRAND, StandardActions.SOFT_DELETE) },
    brandControllers.softDeleteSingleBrandController,
  );

  app.patch(
    "/brand/:brandId/soft/toggle/",
    { preHandler: authorize(ModelNames.BRAND, StandardActions.SOFT_DELETE) },
    brandControllers.toggleBrandSoftDeleteController,
  );

  app.patch(
    "/brand/soft/toggle/many/",
    {
      preHandler: authorize(ModelNames.BRAND, StandardActions.SOFT_DELETE_MANY),
    },
    brandControllers.toggleManyBrandSoftDeleteController,
  );

  app.patch(
    "/brand/bulk/soft/",
    {
      preHandler: authorize(ModelNames.BRAND, StandardActions.SOFT_DELETE_MANY),
    },
    brandControllers.softDeleteManyBrandController,
  );

  app.delete(
    "/brand/:brandId/",
    { preHandler: authorize(ModelNames.BRAND, StandardActions.HARD_DELETE) },
    brandControllers.hardDeleteSingleBrandController,
  );

  app.delete(
    "/brand/bulk/",
    {
      preHandler: authorize(ModelNames.BRAND, StandardActions.HARD_DELETE_MANY),
    },
    brandControllers.hardDeleteManyBrandController,
  );
};
