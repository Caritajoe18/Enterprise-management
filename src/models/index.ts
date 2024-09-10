import { Sequelize } from 'sequelize';
import sequelize  from '../db' // Adjust the path to your Sequelize instance
import Role from './role';
import Permission from './permission';
import Admins from './admin';

// Initialize models and associate them
const models = {
  Admins,
  Role,
  Permission,
};

// Call the associate method for each model to set up associations
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

export { sequelize };
export default models;
