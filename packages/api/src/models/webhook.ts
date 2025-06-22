import { DataTypes, Model } from 'sequelize';
import { sequelizeInstance } from './index';
// import Team from './team'; // For associations

export enum WebhookService {
  Slack = 'slack',
  Generic = 'generic',
}

// For queryParams and headers, which were Map in Mongoose.
// We'll use JSONB to store object-like data (key-value pairs).
interface KeyValuePairs {
  [key: string]: string;
}

class Webhook extends Model {
  public id!: string; // Adding a primary key
  public teamId!: string; // Foreign key to Team model
  public service!: WebhookService;
  public name!: string;
  public url?: string;
  public description?: string;
  public queryParams?: KeyValuePairs;
  public headers?: KeyValuePairs;
  public body?: string; // Could be JSON string, text, etc.

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Webhook.init(
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
    service: {
      type: DataTypes.ENUM(...Object.values(WebhookService)),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING, // Consider DataTypes.TEXT if URLs can be very long
      allowNull: true, // Was required: false
      validate: {
        isUrl: true, // Add URL validation if appropriate
      },
    },
    description: {
      type: DataTypes.TEXT, // TEXT for longer descriptions
      allowNull: true,
    },
    queryParams: {
      type: DataTypes.JSONB, // Using JSONB for Map type
      allowNull: true,
    },
    headers: {
      type: DataTypes.JSONB, // Using JSONB for Map type
      allowNull:true,
    },
    body: {
      type: DataTypes.TEXT, // TEXT for request body content
      allowNull: true,
    },
  },
  {
    sequelize: sequelizeInstance,
    modelName: 'Webhook',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['teamId', 'service', 'name'],
      },
    ],
  },
);

// Define associations here
// Example:
// Webhook.belongsTo(Team, { foreignKey: 'teamId' });

export default Webhook;
