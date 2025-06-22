import { DataTypes, Model, Sequelize } from 'sequelize';

import { sequelizeInstance } from './index';
// import Team from './team'; // We'll need to define Team model later for associations
// import User from './user'; // We'll need to define User model later for associations
// import SavedSearch from './savedSearch'; // We'll need to define SavedSearch model later for associations
// import Dashboard from './dashboard'; // We'll need to define Dashboard model later for associations

export enum AlertThresholdType {
  ABOVE = 'above',
  BELOW = 'below',
}

export enum AlertState {
  ALERT = 'ALERT',
  DISABLED = 'DISABLED',
  INSUFFICIENT_DATA = 'INSUFFICIENT_DATA',
  OK = 'OK',
}

export type AlertInterval =
  | '1m'
  | '5m'
  | '15m'
  | '30m'
  | '1h'
  | '6h'
  | '12h'
  | '1d';

export type AlertChannel =
  | {
      type: 'webhook';
      webhookId: string;
    }
  | {
      type: null;
    };

export enum AlertSource {
  SAVED_SEARCH = 'saved_search',
  TILE = 'tile',
}

interface SilencedInfo {
  by?: string; // User ID
  at: Date;
  until: Date;
}

class Alert extends Model {
  public id!: string; // Changed from ObjectId to string (UUID)
  public channel!: AlertChannel;
  public interval!: AlertInterval;
  public source?: AlertSource;
  public state!: AlertState;
  public teamId!: string; // Changed from ObjectId to string (UUID)
  public threshold!: number;
  public thresholdType?: AlertThresholdType;

  // Message template
  public name?: string | null;
  public message?: string | null;

  // SavedSearch alerts
  public groupBy?: string;
  public savedSearchId?: string; // Changed from ObjectId to string (UUID)

  // Tile alerts
  public dashboardId?: string; // Changed from ObjectId to string (UUID)
  public tileId?: string;

  // Silenced
  public silenced?: SilencedInfo;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Alert.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    threshold: {
      type: DataTypes.FLOAT, // Using FLOAT for number
      allowNull: false,
    },
    thresholdType: {
      type: DataTypes.ENUM(...Object.values(AlertThresholdType)),
      allowNull: true, // Was false, but schema had it as not required
    },
    interval: {
      type: DataTypes.STRING, // Assuming AlertInterval values are stored as strings
      allowNull: false,
    },
    channel: {
      type: DataTypes.JSONB, // Using JSONB for complex object type
      allowNull: false, // Assuming channel is required
    },
    state: {
      type: DataTypes.ENUM(...Object.values(AlertState)),
      defaultValue: AlertState.OK,
      allowNull: false,
    },
    source: {
      type: DataTypes.ENUM(...Object.values(AlertSource)),
      defaultValue: AlertSource.SAVED_SEARCH,
      allowNull: true, // Was false, but schema had it as not required
    },
    teamId: {
      // Foreign key for Team
      type: DataTypes.UUID,
      allowNull: false, // Assuming a team is always required
      // references: { model: 'Teams', key: 'id' } // Define association later
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    savedSearchId: {
      // Foreign key for SavedSearch
      type: DataTypes.UUID,
      allowNull: true,
      // references: { model: 'SavedSearches', key: 'id' } // Define association later
    },
    groupBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dashboardId: {
      // Foreign key for Dashboard
      type: DataTypes.UUID,
      allowNull: true,
      // references: { model: 'Dashboards', key: 'id' } // Define association later
    },
    tileId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    silenced: {
      type: DataTypes.JSONB, // Using JSONB for SilencedInfo
      allowNull: true,
    },
  },
  {
    sequelize: sequelizeInstance,
    modelName: 'Alert',
    timestamps: true,
  },
);

// Define associations here after all models are defined
// Example:
// Alert.belongsTo(Team, { foreignKey: 'teamId' });
// Alert.belongsTo(SavedSearch, { foreignKey: 'savedSearchId' });
// Alert.belongsTo(Dashboard, { foreignKey: 'dashboardId' });
// If 'by' in silenced refers to a User:
// Alert.belongsTo(User, { foreignKey: 'silenced.by', constraints: false, as: 'SilencedByUser' });

export default Alert;
