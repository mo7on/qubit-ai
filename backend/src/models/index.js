const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./user.model')(sequelize, Sequelize);
db.Problem = require('./problem.model')(sequelize, Sequelize);
db.Solution = require('./solution.model')(sequelize, Sequelize);

// Define relationships
db.User.hasMany(db.Problem);
db.Problem.belongsTo(db.User);

db.User.hasMany(db.Solution);
db.Solution.belongsTo(db.User);

db.Problem.hasMany(db.Solution);
db.Solution.belongsTo(db.Problem);

module.exports = db;