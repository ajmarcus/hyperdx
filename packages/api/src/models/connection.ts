import { DataTypes, Model } from 'sequelize';

import { sequelizeInstance } from './index';
// import Team from './team'; // For associations

class Connection extends Model {
  public id!: string; // Changed from ObjectId to string (UUID)
  public host!: string;
  public name!: string;
  public password!: string;
  public username!: string;
  public teamId!: string; // Foreign key to Team model

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Connection.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    host: {
      type: DataTypes.STRING,
      allowNull: false, // Assuming host is required
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false, // Assuming name is required
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false, // Assuming password is required
      // In Sequelize, to achieve `select: false` functionality similar to Mongoose,
      // you would typically define a default scope that excludes the password field,
      // or manually specify attributes in your queries.
      // e.g., defaultScope: { attributes: { exclude: ['password'] } }
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false, // Assuming username is required
    },
    teamId: {
      // Foreign key for Team
      type: DataTypes.UUID,
      allowNull: false,
      // references: { model: 'Teams', key: 'id' } // Define association later
    },
  },
  {
    sequelize: sequelizeInstance,
    modelName: 'Connection',
    timestamps: true,
    defaultScope: {
      attributes: { exclude: ['password'] },
    },
  },
);

// Define associations here
// Example:
// Connection.belongsTo(Team, { foreignKey: 'teamId' });

export default Connection;
