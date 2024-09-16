import { Sequelize } from 'sequelize';
import sequelize  from '../db' // Adjust the path to your Sequelize instance
import Roles from './role';
import Permissions from './permission';
import Admins from './admin';
import NavParents from './navparent';

// Initialize models and associate them
const models = {
  Admins,
  Roles,
  Permissions,
  NavParents,
};

// Call the associate method for each model to set up associations
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

export { sequelize };
export default models;
