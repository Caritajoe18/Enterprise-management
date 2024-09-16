import { Request, Response } from "express";
import NavParent from "../models/navparent";
import Permissions from "../models/permission"
import { AuthRequest } from "../middleware/staffPermissions";
import Role from "../models/role";
import RolePermission from "../models/rolepermission";

export const createNavParent = async (req: Request, res: Response) => {
  const { name, iconUrl } = req.body;

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
  } catch (error) {
    console.error("Error creating NavParent:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


export const getNavWithPermissions = async (req: Request, res: Response) => {
    try {
      const navigations = await NavParent.findAll({
        include: [
          {
            model: Permissions,
            as: "permissions",
            where: {
              isNav: true,
            },
            attributes: ['id', 'name', 'slug'], 
          },
        ],
      });
  
      if (!navigations || navigations.length === 0) {
        return res.status(404).json({ message: "No navigations with permissions found" });
      }
  
      return res.status(200).json(navigations);
    } catch (error) {
      console.error("Error fetching navigations with permissions:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };

  export const getUserNavPermissions = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.admin || !("roleId" in req.admin)) {
            return res.status(400).json({ message: "No roleId found in user" });
          }
      
      
      const {roleId} = req.admin 
      //console.log(roleId, req.admin, "the user roleId and admin data");
    
      console.log("this is role id :" , roleId, req.admin, "the userr")
      const rolePermissions = await RolePermission.findAll({
        where: { roleId },
      });
  
      if (rolePermissions.length === 0) {
        return res.status(404).json({ message: 'No navigation permissions found for this role' });
      }
  

      const permissionIds = rolePermissions.map((rolePerm: any) => rolePerm.permissionId);
  

      const permissions = await Permissions.findAll({
        where: {
          id: permissionIds,
          isNav: true,
        },
      });
  
      if (permissions.length === 0) {
        return res.status(404).json({ message: 'No navigation permissions found' });
      }
  
      
      const navParentIds = permissions.map((perm: any) => perm.navParentId).filter(Boolean);
  

      const navParents = await NavParent.findAll({
        where: {
          id: navParentIds,
        },
      });
  

      const result = permissions.map((permission: any) => {
        const associatedNavParent = navParents.find(navParent => navParent.dataValues.id === permission.navParentId);
        return {
          permissionName: permission.name,
          navParentName: associatedNavParent ? associatedNavParent.dataValues.name : null,
        };
      });
  
      return res.status(200).json({ navParentsWithPermissions: result });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      }
      res.status(500).json({ error: "An error occurred" });
    }
  };
  
  
  



//   export const getUserNavPermissions = async (req: AuthRequest, res: Response) => {
//     try {
//       const roleId  = req.admin?.roleId; // Assuming req.user contains roleId
  
//       // Find all permissions associated with the user's role
//       const role = await Role.findOne({
//         where: { id: roleId },
//         include: [
//           {
//             model: Permissions,
//             as: 'permissions', // Ensure this alias matches your associations
//             include: [
//               {
//                 model: NavParent,
//                 as: 'navParent', // Alias should match your associations
//                 where: { isNav: true }, // Fetch only those where isNav is true
//               },
//             ],
//           },
//         ],
//       });
  
//       if (!role) {
//         return res.status(404).json({ message: 'Role not found' });
//       }
  
//       // Extract permissions and navParents from the role
//       const navParentsWithPermissions = role.permissions.map((permission: any) => ({
//         permissionName: permission.name,
//         navParent: permission.navParent ? permission.navParent.name : null,
//       }));
  
//       return res.status(200).json({
//         navParentsWithPermissions,
//       });
//     } catch (error) {
//       console.error('Error fetching navigations with permissions:', error);
//       return res.status(500).json({ message: 'Internal Server Error' });
//     }
//   };
  
