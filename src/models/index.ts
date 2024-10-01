import sequelize  from '../db' 
import Role from './role';
import Permission from './permission';
import Admins from './admin';
import NavParent from './navparent';
import Products from './products';
import Departments from './department';
import RolePermission from './rolepermission';
import Ledger from './ledger';
import Customer from './customers';

const models = {
  Admins,
  Role,
  Permission,
  NavParent,
  RolePermission,
  Departments,
  Products,
  Customer,
  Ledger,
};


Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});
// Products.belongsTo(Departments, { foreignKey: 'departmentId', onDelete: 'SET NULL' });
// Departments.hasMany(Products, { foreignKey: 'departmentId', onDelete: 'SET NULL' });


export { sequelize };
export default models;
