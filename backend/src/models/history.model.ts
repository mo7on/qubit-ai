import { Model, DataTypes, Sequelize } from 'sequelize';

interface HistoryAttributes {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

export class History extends Model<HistoryAttributes> implements HistoryAttributes {
  public id!: string;
  public userId!: string;
  public action!: string;
  public entityType!: string;
  public entityId?: string;
  public details?: any;
  public ipAddress?: string;
  public userAgent?: string;
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  (History as any).init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false
    },
    entityType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    details: {
      type: DataTypes.JSON,
      allowNull: true
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userAgent: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'history',
    modelName: 'history'
  });
  
  return History;
};