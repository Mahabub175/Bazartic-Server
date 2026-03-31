import { FastifyInstance } from "fastify";
import { attributeControllers } from "./attribute.controller";
import { authorize } from "../../middlewares/authorize";
import { ModelNames, StandardActions } from "../../global/global.constants";

export const attributeRoutes = async (app: FastifyInstance) => {
  app.post(
    "/attribute/",
    { preHandler: authorize(ModelNames.ATTRIBUTE, StandardActions.CREATE) },
    attributeControllers.createAttributeController,
  );

  app.post(
    "/attribute/bulk/",
    { preHandler: authorize(ModelNames.ATTRIBUTE, StandardActions.CREATE) },
    attributeControllers.createBulkAttributesController,
  );

  app.post(
    "/attribute/recover/",
    { preHandler: authorize(ModelNames.ATTRIBUTE, StandardActions.RECOVER) },
    attributeControllers.recoverAttributeController,
  );

  app.post(
    "/attribute/recover/all/",
    { preHandler: authorize(ModelNames.ATTRIBUTE, StandardActions.RECOVER) },
    attributeControllers.recoverAllAttributeController,
  );

  app.get(
    "/attribute/",
    { preHandler: authorize(ModelNames.ATTRIBUTE, StandardActions.READ_MANY) },
    attributeControllers.getAllAttributeController,
  );

  app.get(
    "/attribute/:attributeId/",
    { preHandler: authorize(ModelNames.ATTRIBUTE, StandardActions.READ) },
    attributeControllers.getSingleAttributeController,
  );

  app.patch(
    "/attribute/:attributeId/",
    { preHandler: authorize(ModelNames.ATTRIBUTE, StandardActions.UPDATE) },
    attributeControllers.updateSingleAttributeController,
  );

  app.patch(
    "/attribute/:attributeId/status/toggle/",
    { preHandler: authorize(ModelNames.ATTRIBUTE, StandardActions.UPDATE) },
    attributeControllers.toggleAttributeStatusController,
  );

  app.patch(
    "/attribute/status/toggle/many/",
    {
      preHandler: authorize(ModelNames.ATTRIBUTE, StandardActions.UPDATE_MANY),
    },
    attributeControllers.toggleManyAttributeStatusController,
  );

  app.patch(
    "/attribute/:attributeId/soft/",
    {
      preHandler: authorize(ModelNames.ATTRIBUTE, StandardActions.SOFT_DELETE),
    },
    attributeControllers.softDeleteSingleAttributeController,
  );

  app.patch(
    "/attribute/:attributeId/soft/toggle/",
    {
      preHandler: authorize(ModelNames.ATTRIBUTE, StandardActions.SOFT_DELETE),
    },
    attributeControllers.toggleAttributeSoftDeleteController,
  );

  app.patch(
    "/attribute/soft/toggle/many/",
    {
      preHandler: authorize(
        ModelNames.ATTRIBUTE,
        StandardActions.SOFT_DELETE_MANY,
      ),
    },
    attributeControllers.toggleManyAttributeSoftDeleteController,
  );

  app.patch(
    "/attribute/bulk/soft/",
    {
      preHandler: authorize(
        ModelNames.ATTRIBUTE,
        StandardActions.SOFT_DELETE_MANY,
      ),
    },
    attributeControllers.softDeleteManyAttributeController,
  );

  app.delete(
    "/attribute/:attributeId/",
    {
      preHandler: authorize(ModelNames.ATTRIBUTE, StandardActions.HARD_DELETE),
    },
    attributeControllers.hardDeleteSingleAttributeController,
  );

  app.delete(
    "/attribute/bulk/",
    {
      preHandler: authorize(
        ModelNames.ATTRIBUTE,
        StandardActions.HARD_DELETE_MANY,
      ),
    },
    attributeControllers.hardDeleteManyAttributeController,
  );
};
