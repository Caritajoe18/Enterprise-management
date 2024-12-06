import { Request, Response } from "express";
import NavParent from "../models/navparent";
import Permissions from "../models/permission";
import { AuthRequest } from "../middleware/staffPermissions";
import RolePermission from "../models/rolepermission";
import Admins from "../models/admin";

export const createNavParent = async (req: Request, res: Response) => {
  const { name} = req.body;

  try {
    const slug = name.toLowerCase().replace(/ /g, "-");

    const existingNavParent = await NavParent.findOne({ where: { slug } });
    if (existingNavParent) {
      return res
        .status(400)
        .json({ message: "NavParent with this name already exists" });
    }

    const newNavParent = await NavParent.create({
      ...req.body,
      slug,
    });

    return res.status(201).json({
      message: "NavParent created successfully",
      navParent: newNavParent,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An error occurred" });
  }
};

export const getAllNavandPerm = async (req: Request, res: Response) => {
  try {
    const navParents = await NavParent.findAll({
      attributes: ["id", "name"],
      order: [["orderIndex", "ASC"]],
    });

    if (navParents.length === 0) {
      return res.status(404).json({ message: "No NavParents found" });
    }

    const navParentIds = navParents.map((navParent) => navParent.dataValues.id);
    const permissions = await Permissions.findAll({
      where: {
        navParentId: navParentIds,
      },
      attributes: ["id", "name", "slug", "url", "navParentId"],
      order: [["orderIndex", "ASC"]],
    });

    const navParentMap: Record<number, any> = {};

    navParents.forEach((navParent: any) => {
      navParentMap[navParent.id] = {
        navParentName: navParent.name,
        permissions: [],
      };
    });

    permissions.forEach((permission: any) => {
      if (permission.navParentId && navParentMap[permission.navParentId]) {
        navParentMap[permission.navParentId].permissions.push({
          id: permission.id,
          name: permission.name,
          slug: permission.slug,
          url: permission.url,
        });
      }
    });

    const result = Object.values(navParentMap);

    return res.status(200).json({ navParentsWithPermissions: result });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An error occurred" });
  }
};

export const getNavWithPermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await Permissions.findAll({
      where: {
        isNav: true,
      },
      include: [
        {
          model: NavParent,
          as: "navParent",
          attributes: ["id", "name", "slug"],
        },
      ],
    });

    if (!permissions || permissions.length === 0) {
      return res.status(404).json({ message: "No permissions found" });
    }

    return res.status(200).json(permissions);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An error occurred" });
  }
};

// export const getUserNavPermissions = async (
//   req: AuthRequest,
//   res: Response
// ) => {
//   try {
//     const admin = req.admin as Admins;
//     if (!req.admin || !("roleId" in req.admin)) {
//       return res.status(400).json({ message: "No roleId found in user" });
//     }

//     const { roleId, isAdmin } = admin.dataValues;

//     if (isAdmin) {
//       const navParents = await NavParent.findAll({
//         where: { isNav: true },
//         order: [["orderIndex", "ASC"]],
//       });
//       const permissions = await Permissions.findAll({
//         where: { isNav: true },
//         order: [["orderIndex", "ASC"]],
//       });

//       const navParentMap: Record<number, any> = {};
//       navParents.forEach((navParent: any) => {
//         navParentMap[navParent.id] = {
//           navParentId: navParent.id,
//           navParentName: navParent.name,
//           navParentSlug: navParent.slug,
//           navParentIcon: navParent.iconUrl,
//           permissions: [],
//         };
//       });

//       permissions.forEach((permission: any) => {
//         if (permission.navParentId && navParentMap[permission.navParentId]) {
//           navParentMap[permission.navParentId].permissions.push({
//             name: permission.name,
//             slug: permission.slug,
//           });
//         }
//       });

//       const result = Object.values(navParentMap);
//       return res.status(200).json({ navParentsWithPermissions: result });
//     }

//     const rolePermissions = await RolePermission.findAll({
//       where: { roleId },
//     });

//     if (rolePermissions.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No navigation permissions found for this role" });
//     }

//     const permissionIds = rolePermissions.map(
//       (rolePerm: any) => rolePerm.permissionId
//     );

//     const permissions = await Permissions.findAll({
//       where: {
//         id: permissionIds,
//         isNav: true,
//       },
//     });

//     if (permissions.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No navigation permissions found" });
//     }

//     const navParentIds = permissions
//       .map((perm: any) => perm.navParentId)
//       .filter(Boolean);

//     const navParents = await NavParent.findAll({
//       where: {
//         id: navParentIds,
//       },
//     });
//     const navParentMap: Record<number, any> = {};
//     navParents.forEach((navParent: any) => {
//       navParentMap[navParent.id] = {
//         navParentId: navParent.id,
//         navParentName: navParent.name,
//         navParentSlug: navParent.slug,
//         navParentIcon: navParent.iconUrl,
//         permissions: [],
//       };
//     });

//     permissions.forEach((permission: any) => {
//       if (permission.navParentId && navParentMap[permission.navParentId]) {
//         navParentMap[permission.navParentId].permissions.push({
//           name: permission.name,
//           slug: permission.slug,
//         });
//       }
//     });

//      const result = Object.values(navParentMap);
//     // const result = Object.values(navParentMap).map((navParent: any) => {
//     //   if (!navParent.permissions.length && navParentIds.includes(navParent.navParentId)) {
//     //     navParent.permissions = []; 
//     //   }
//     //   return navParent;
//     // });
//     return res.status(200).json({ navParentsWithPermissions: result });
//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       res.status(500).json({ error: error.message });
//     }
//     res.status(500).json({ error: "An error occurred" });
//   }
// };
export const getUserNavPermissions = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const admin = req.admin as Admins;
    if (!req.admin || !("roleId" in req.admin)) {
      return res.status(400).json({ message: "No roleId found in user" });
    }

    const { roleId, isAdmin } = admin.dataValues;

    if (isAdmin) {
      const navParents = await NavParent.findAll({
        where: { isNav: true },
        order: [["orderIndex", "ASC"]],
      });
      const permissions = await Permissions.findAll({
        include: [
          {
            model: NavParent,
            as: "navParent",
          },
        ],
        order: [["orderIndex", "ASC"]],
      });

      const navParentMap: Record<number, any> = {};
      navParents.forEach((navParent: any) => {
        navParentMap[navParent.id] = {
          navParentId: navParent.id,
          navParentName: navParent.name,
          navParentSlug: navParent.slug,
          navParentIcon: navParent.iconUrl,
          permissions: [],
        };
      });

      permissions.forEach((permission: any) => {
        if (permission.navParentId && navParentMap[permission.navParentId]) {
          if (permission.isNav) {
            navParentMap[permission.navParentId].permissions.push({
              name: permission.name,
              slug: permission.slug,
            });
          }
        }
      });

      const result = Object.values(navParentMap);
      return res.status(200).json({ navParentsWithPermissions: result });
    }

    const rolePermissions = await RolePermission.findAll({
      where: { roleId },
    });

    if (rolePermissions.length === 0) {
      return res
        .status(404)
        .json({ message: "No navigation permissions found for this role" });
    }

    const permissionIds = rolePermissions.map(
      (rolePerm: any) => rolePerm.permissionId
    );

    const permissions = await Permissions.findAll({
      include: [
        {
          model: NavParent,
          as: "navParent",
        },
      ],
      where: {
        id: permissionIds,
      },
      order: [["orderIndex", "ASC"]],
    });

    const navParentIds = permissions
      .map((perm: any) => perm.navParentId)
      .filter(Boolean);

    const navParents = await NavParent.findAll({
      where: {
        id: navParentIds,
        isNav: true,
      },
    });

    const navParentMap: Record<number, any> = {};
    navParents.forEach((navParent: any) => {
      navParentMap[navParent.id] = {
        navParentId: navParent.id,
        navParentName: navParent.name,
        navParentSlug: navParent.slug,
        navParentIcon: navParent.iconUrl,
        permissions: [],
      };
    });

    permissions.forEach((permission: any) => {
      if (permission.navParentId && navParentMap[permission.navParentId]) {
        if (permission.isNav) {
          navParentMap[permission.navParentId].permissions.push({
            name: permission.name,
            slug: permission.slug,
          });
        }
      }
    });

    const result = Object.values(navParentMap);
    return res.status(200).json({ navParentsWithPermissions: result });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An error occurred" });
  }
};

export const getNavParentsWithPermissions = async (
  req: Request,
  res: Response
) => {
  try {
    const navParents = await NavParent.findAll({
      include: [
        {
          model: Permissions,
          as: "permissions", // Alias, if any
          attributes: ["id", "name", "url", "slug"], // Select specific fields
        },
      ],
      attributes: ["id", "name", "iconUrl", "slug"], // Select specific fields for NavParent
    });
    return res.status(200).json({ navParents });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};
