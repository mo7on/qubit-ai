module.exports = (sequelize, Sequelize) => {
  const History = sequelize.define('history', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    action: {
      type: Sequelize.STRING,
      allowNull: false
    },
    entityType: {
      type: Sequelize.STRING,
      allowNull: false
    },
    entityId: {
      type: Sequelize.UUID,
      allowNull: true
    },
    details: {
      type: Sequelize.JSON,
      allowNull: true
    },
    ipAddress: {
      type: Sequelize.STRING,
      allowNull: true
    },
    userAgent: {
      type: Sequelize.STRING,
      allowNull: true
    }
  });
  
  return History;
};