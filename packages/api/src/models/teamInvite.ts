import { DataTypes, Model } from 'sequelize';
import { sequelizeInstance } from './index';
// import Team from './team'; // For associations

class TeamInvite extends Model {
  public id!: string; // Adding a primary key
  public teamId!: string; // Foreign key to Team model
  public email!: string;
  public name?: string;
  public token!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TeamInvite.init(
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true, // Add email validation
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    token: {
      type: DataTypes.STRING, // Or DataTypes.UUID if the token is a UUID
      allowNull: false,
      unique: true, // Tokens should be unique
    },
  },
  {
    sequelize: sequelizeInstance,
    modelName: 'TeamInvite',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['teamId', 'email'],
      },
      // TTL index { createdAt: 1 }, { expireAfterSeconds: ms('30d') / 1000 }
      // As mentioned with AlertHistory, this needs to be handled at the application
      // or database level (e.g., cron job for deletion).
    ],
  },
);

// Define associations here
// Example:
// TeamInvite.belongsTo(Team, { foreignKey: 'teamId' });

export default TeamInvite;
