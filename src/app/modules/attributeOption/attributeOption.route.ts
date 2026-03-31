import { FastifyInstance } from "fastify";
import { attributeOptionControllers } from "./attributeOption.controller";
import { authorize } from "../../middlewares/authorize";
import { ModelNames, StandardActions } from "../../global/global.constants";

export const attributeOptionRoutes = async (app: FastifyInstance) => {
  app.post(
    "/attributeOption/",
    {
      preHandler: authorize(
        ModelNames.ATTRIBUTE_OPTION,
        StandardActions.CREATE,
      ),
    },
    attributeOptionControllers.createAttributeOptionController,
  );

  app.post(
    "/attributeOption/bulk/",
    {
      preHandler: authorize(
        ModelNames.ATTRIBUTE_OPTION,
        StandardActions.CREATE,
      ),
    },
    attributeOptionControllers.createBulkAttributeOptionsController,
  );

  app.post(
    "/attributeOption/recover/",
    {
      preHandler: authorize(
        ModelNames.ATTRIBUTE_OPTION,
        StandardActions.RECOVER,
      ),
    },
    attributeOptionControllers.recoverAttributeOptionController,
  );

  app.post(
    "/attributeOption/recover/all/",
    {
      preHandler: authorize(
        ModelNames.ATTRIBUTE_OPTION,
        StandardActions.RECOVER,
      ),
    },
    attributeOptionControllers.recoverAllAttributeOptionController,
  );

  app.get(
    "/attributeOption/",
    {
      preHandler: authorize(
        ModelNames.ATTRIBUTE_OPTION,
        StandardActions.READ_MANY,
      ),
    },
    attributeOptionControllers.getAllAttributeOptionController,
  );

  app.get(
    "/attributeOption/:attributeOptionId/",
    {
      preHandler: authorize(ModelNames.ATTRIBUTE_OPTION, StandardActions.READ),
    },
    attributeOptionControllers.getSingleAttributeOptionController,
  );

  app.patch(
    "/attributeOption/:attributeOptionId/",
    {
      preHandler: authorize(
        ModelNames.ATTRIBUTE_OPTION,
        StandardActions.UPDATE,
      ),
    },
    attributeOptionControllers.updateSingleAttributeOptionController,
  );

  app.patch(
    "/attributeOption/:attributeOptionId/status/toggle/",
    {
      preHandler: authorize(
        ModelNames.ATTRIBUTE_OPTION,
        StandardActions.UPDATE,
      ),
    },
    attributeOptionControllers.toggleAttributeOptionStatusController,
  );

  app.patch(
    "/attributeOption/status/toggle/many/",
    {
      preHandler: authorize(
        ModelNames.ATTRIBUTE_OPTION,
        StandardActions.UPDATE,
      ),
    },
    attributeOptionControllers.toggleManyAttributeOptionStatusController,
  );

  app.patch(
    "/attributeOption/:attributeOptionId/soft/",
    {
      preHandler: authorize(
        ModelNames.ATTRIBUTE_OPTION,
        StandardActions.SOFT_DELETE,
      ),
    },
    attributeOptionControllers.softDeleteSingleAttributeOptionController,
  );

  app.patch(
    "/attributeOption/:attributeOptionId/soft/toggle/",
    {
      preHandler: authorize(
        ModelNames.ATTRIBUTE_OPTION,
        StandardActions.SOFT_DELETE,
      ),
    },
    attributeOptionControllers.toggleAttributeOptionSoftDeleteController,
  );

  app.patch(
    "/attributeOption/soft/toggle/many/",
    {
      preHandler: authorize(
        ModelNames.ATTRIBUTE_OPTION,
        StandardActions.SOFT_DELETE_MANY,
      ),
    },
    attributeOptionControllers.toggleManyAttributeOptionSoftDeleteController,
  );

  app.patch(
    "/attributeOption/bulk/soft/",
    {
      preHandler: authorize(
        ModelNames.ATTRIBUTE_OPTION,
        StandardActions.SOFT_DELETE_MANY,
      ),
    },
    attributeOptionControllers.softDeleteManyAttributeOptionController,
  );

  app.delete(
    "/attributeOption/:attributeOptionId/",
    {
      preHandler: authorize(
        ModelNames.ATTRIBUTE_OPTION,
        StandardActions.HARD_DELETE,
      ),
    },
    attributeOptionControllers.hardDeleteSingleAttributeOptionController,
  );

  app.delete(
    "/attributeOption/bulk/",
    {
      preHandler: authorize(
        ModelNames.ATTRIBUTE_OPTION,
        StandardActions.HARD_DELETE_MANY,
      ),
    },
    attributeOptionControllers.hardDeleteManyAttributeOptionController,
  );
};
