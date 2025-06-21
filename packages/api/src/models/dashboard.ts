import { DataTypes, Model } from 'sequelize';
import { sequelizeInstance } from './index';
// import Team from './team'; // For associations

// Assuming DashboardSchema from '@hyperdx/common-utils/dist/types' has a structure like:
// { name: string, tiles: any[], tags?: string[] }
// We will define the Sequelize model based on this assumed structure.
// If the actual structure is different, the model definition might need adjustments.

class Dashboard extends Model {
  public id!: string; // Changed from ObjectId to string (UUID)
  public name!: string;
  public tiles!: any[]; // Representing Mixed type with any[] for JSONB
  public teamId!: string; // Foreign key to Team model
  public tags!: string[];

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Dashboard.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tiles: {
      type: DataTypes.JSONB, // Using JSONB for Mixed type / complex array
      allowNull: false,
    },
    teamId: { // Foreign key for Team
      type: DataTypes.UUID,
      allowNull: false,
      // references: { model: 'Teams', key: 'id' } // Define association later
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING), // Using ARRAY type for array of strings
      defaultValue: [],
      allowNull: false,
    },
  },
  {
    sequelize: sequelizeInstance,
    modelName: 'Dashboard',
    timestamps: true,
  },
);

// Define associations here
// Example:
// Dashboard.belongsTo(Team, { foreignKey: 'teamId' });

export default Dashboard;
