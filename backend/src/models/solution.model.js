module.exports = (sequelize, Sequelize) => {
  const Solution = sequelize.define('solution', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    isAiGenerated: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    rating: {
      type: Sequelize.INTEGER,
      validate: {
        min: 1,
        max: 5
      },
      allowNull: true
    }
  });
  
  return Solution;
};