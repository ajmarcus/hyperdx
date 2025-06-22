import { Sequelize } from 'sequelize';
import * as config from '@/config';
import logger from '@/utils/logger';

const sequelize = new Sequelize(config.SQLITE_PATH);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('SQLite connected');
    await sequelize.sync(); // Synchronize all models
    logger.info('Database synchronized');
  } catch (err: any) {
    logger.error('Unable to connect to the database or synchronize:', err);
    process.exit(1);
  }
};

export const sequelizeInstance = sequelize;

// Import all models
import User from './user';
import Team from './team';
import TeamInvite from './teamInvite';
import Source from './source';
import SavedSearch from './savedSearch';
import Dashboard from './dashboard';
import Connection from './connection';
import Alert from './alert';
import AlertHistory from './alertHistory';
import Webhook from './webhook';

// Define Associations

// User associations
User.belongsTo(Team, { foreignKey: 'teamId', as: 'team' }); // Assuming a user belongs to a team
// Or if a user can have multiple teams or vice-versa, use hasMany/belongsToMany

// Team associations
Team.hasMany(User, { foreignKey: 'teamId', as: 'users' });
Team.hasMany(TeamInvite, { foreignKey: 'teamId', as: 'invites' });
Team.hasMany(Source, { foreignKey: 'teamId', as: 'sources' });
Team.hasMany(SavedSearch, { foreignKey: 'teamId', as: 'savedSearches' });
Team.hasMany(Dashboard, { foreignKey: 'teamId', as: 'dashboards' });
Team.hasMany(Connection, { foreignKey: 'teamId', as: 'connections' });
Team.hasMany(Alert, { foreignKey: 'teamId', as: 'alerts' });
Team.hasMany(Webhook, { foreignKey: 'teamId', as: 'webhooks' });

// TeamInvite associations
TeamInvite.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

// Source associations
Source.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });
Source.belongsTo(Connection, { foreignKey: 'connectionId', as: 'connection' });
Source.hasMany(SavedSearch, { foreignKey: 'sourceId', as: 'savedSearches' }); // If a source can have multiple saved searches

// SavedSearch associations
SavedSearch.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });
SavedSearch.belongsTo(Source, { foreignKey: 'sourceId', as: 'source' });
SavedSearch.hasMany(Alert, { foreignKey: 'savedSearchId', as: 'alerts' }); // If a saved search can trigger multiple alerts

// Dashboard associations
Dashboard.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });
Dashboard.hasMany(Alert, { foreignKey: 'dashboardId', as: 'alerts' }); // Assuming alerts can be tied to dashboards (specifically tiles)

// Connection associations
Connection.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });
Connection.hasMany(Source, { foreignKey: 'connectionId', as: 'sources' });

// Alert associations
Alert.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });
Alert.belongsTo(SavedSearch, { foreignKey: 'savedSearchId', as: 'savedSearch', required: false });
Alert.belongsTo(Dashboard, { foreignKey: 'dashboardId', as: 'dashboard', required: false });
// Alert.belongsTo(User, { foreignKey: 'silenced.by', constraints: false, as: 'SilencedByUser' }); // For silenced.by if it's a direct FK
Alert.hasMany(AlertHistory, { foreignKey: 'alertId', as: 'history' });

// AlertHistory associations
AlertHistory.belongsTo(Alert, { foreignKey: 'alertId', as: 'alert' });

// Webhook associations
Webhook.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

export {
  User,
  Team,
  TeamInvite,
  Source,
  SavedSearch,
  Dashboard,
  Connection,
  Alert,
  AlertHistory,
  Webhook,
  sequelizeInstance as sequelize, // export instance as 'sequelize' for convenience
};
