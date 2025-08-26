import { Sequelize } from "sequelize";
import { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST } from './envConf.js';

console.log(DB_NAME);

const sequelize = new Sequelize(
  DB_NAME,
  DB_USER ,
  DB_PASSWORD || '',
  {
    host: DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
  }
);

export default sequelize;