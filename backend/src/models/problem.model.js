module.exports = (sequelize, Sequelize) => {
  const Problem = sequelize.define('problem', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    imageUrls: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      defaultValue: []
    },
    category: {
      type: Sequelize.STRING
    },
    difficulty: {
      type: Sequelize.ENUM('easy', 'medium', 'hard'),
      defaultValue: 'medium'
    },
    status: {
      type: Sequelize.ENUM('open', 'in-progress', 'solved'),
      defaultValue: 'open'
    }
  });
  
  return Problem;
};