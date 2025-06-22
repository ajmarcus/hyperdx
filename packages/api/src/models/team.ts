import { DataTypes, Model } from 'sequelize';

import { sequelizeInstance } from './index';

class Team extends Model {
  public id!: string; // Changed from ObjectId to string (UUID)
  public name!: string;
  public allowedAuthMethods?: string[]; // Representing array of strings
  public apiKey!: string;
  public hookId!: string;
  public collectorAuthenticationEnforced!: boolean;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Team.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false, // Assuming name is required
    },
    allowedAuthMethods: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true, // Based on Mongoose schema (optional field)
    },
    apiKey: {
      type: DataTypes.UUID, // Storing as UUID
      defaultValue: DataTypes.UUIDV4, // Auto-generate UUID
      allowNull: false,
      unique: true, // API keys should be unique
    },
    hookId: {
      type: DataTypes.UUID, // Storing as UUID
      defaultValue: DataTypes.UUIDV4, // Auto-generate UUID
      allowNull: false,
      unique: true, // Hook IDs should be unique
    },
    collectorAuthenticationEnforced: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {
    sequelize: sequelizeInstance,
    modelName: 'Team',
    timestamps: true,
  },
);

export default Team;
