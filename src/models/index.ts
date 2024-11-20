import sequelize from "../db";
import Role from "./role";
import Permission from "./permission";
import Admins from "./admin";
import NavParent from "./navparent";
import Products from "./products";
import Departments from "./department";
import RolePermission from "./rolepermission";
import Ledger from "./ledger";
import Customer from "./customers";
import CustomerOrder from "./customerOrder";
import PharmacyStore from "./pharmacyStore";
import GeneralStore from "./generalStore";
import DepartmentStore from "./departmentStore";
import SupplierLedger from "./supplierLedger";
import Supplier from "./suppliers";
import DepartmentLedger from "./departmentLedger";
import AuthToWeigh from "./AuthToWeigh";
import AccountBook from "./accountBook";
import Weigh from "./weigh";
import Invoice from "./invoice";
import CashTicket from "./CashTicket";
import { LPO } from "./lpo";
import CollectFromGenStore from "./collectFromGenStore";

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
  CustomerOrder,
  PharmacyStore,
  GeneralStore,
  DepartmentStore,
  SupplierLedger,
  Supplier,
  DepartmentLedger,
  AuthToWeigh,
  AccountBook,
  Weigh,
  Invoice,
  CashTicket,
  LPO,
  CollectFromGenStore
};

Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});
// Products.belongsTo(Departments, { foreignKey: 'departmentId', onDelete: 'SET NULL' });
// Departments.hasMany(Products, { foreignKey: 'departmentId', onDelete: 'SET NULL' });

export { sequelize };
export default models;
