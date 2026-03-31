import { FastifyInstance } from "fastify";
import { blogRoutes } from "../modules/blog/blog.route";
import { uploadRoutes } from "../modules/upload/upload.route";
import { userRoutes } from "../modules/user/user.route";
import { authRoutes } from "../modules/auth/auth.route";
import { permissionRoutes } from "../modules/permission/permission.route";
import { roleRoutes } from "../modules/role/role.route";
import { categoryRoutes } from "../modules/category/category.route";
import { brandRoutes } from "../modules/brand/brand.route";
import { attributeOptionRoutes } from "../modules/attributeOption/attributeOption.route";
import { attributeRoutes } from "../modules/attribute/attribute.route";

export const router = async (app: FastifyInstance) => {
  const routes = [
    blogRoutes,
    userRoutes,
    authRoutes,
    permissionRoutes,
    roleRoutes,
    uploadRoutes,
    categoryRoutes,
    brandRoutes,
    attributeOptionRoutes,
    attributeRoutes,
  ];

  for (const route of routes) {
    await route(app);
  }
};
