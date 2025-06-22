import { DataTypes, Model } from 'sequelize';
import { sequelizeInstance } from './index'; // Assuming sequelizeInstance is exported from index.ts

class User extends Model {
  public id!: string;
  public email!: string;
  public password!: string;
  public name!: string;
  public avatar?: string;
  public googleId?: string;
  public githubId?: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    githubId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
  },
  {
    sequelize: sequelizeInstance,
    modelName: 'User', // This will be the table name
    timestamps: true, // Enable timestamps
  },
);

export default User;
