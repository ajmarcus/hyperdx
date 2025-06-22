import { DataTypes, Model } from 'sequelize';
import { sequelizeInstance } from './index';
// import Team from './team'; // For associations
// import Source from './source'; // For associations

// Assuming SavedSearchSchema from '@hyperdx/common-utils/dist/types'
// implies fields like name, select, where, whereLanguage, orderBy, tags.
// The Mongoose schema also includes 'team' and 'source' references.

class SavedSearch extends Model {
  public id!: string; // Changed from ObjectId to string (UUID)
  public teamId!: string; // Foreign key to Team model
  public sourceId!: string; // Foreign key to Source model

  public name?: string;
  public select?: string;
  public where?: string;
  public whereLanguage?: string;
  public orderBy?: string;
  public tags?: string[];

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SavedSearch.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    teamId: { // Foreign key for Team
      type: DataTypes.UUID,
      allowNull: false,
      // references: { model: 'Teams', key: 'id' } // Define association later
    },
    sourceId: { // Foreign key for Source
      type: DataTypes.UUID,
      allowNull: false,
      // references: { model: 'Sources', key: 'id' } // Define association later
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    select: {
      type: DataTypes.STRING, // Or DataTypes.TEXT if it can be very long
      allowNull: true,
    },
    where: {
      type: DataTypes.STRING, // Or DataTypes.TEXT
      allowNull: true,
    },
    whereLanguage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    orderBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true, // Mongoose schema doesn't specify default or required for tags here
      defaultValue: [], // It's common to default arrays to empty
    },
  },
  {
    sequelize: sequelizeInstance,
    modelName: 'SavedSearch',
    timestamps: true,
  },
);

// Define associations here
// Example:
// SavedSearch.belongsTo(Team, { foreignKey: 'teamId' });
// SavedSearch.belongsTo(Source, { foreignKey: 'sourceId' });

export default SavedSearch;
