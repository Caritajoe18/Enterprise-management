import { Sequelize } from 'sequelize';
import sequelize  from '../db' 
import Roles from './role';
import Permissions from './permission';
import Admins from './admin';
import NavParents from './navparent';

const models = {
  Admins,
  Roles,
  Permissions,
  NavParents,
};


Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

export { sequelize };
export default models;
