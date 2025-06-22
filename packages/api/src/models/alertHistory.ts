import { DataTypes, Model, Sequelize } from 'sequelize';
import { sequelizeInstance } from './index';
import { AlertState } from './alert'; // Assuming AlertState is exported from alert.ts
// import Alert from './alert'; // For associations

interface AlertHistoryLastValue {
  startTime: Date;
  count: number;
}

class AlertHistory extends Model {
  public id!: string; // Assuming primary key, not explicitly defined in Mongoose but typical
  public alertId!: string; // Foreign key to Alert model
  public counts!: number;
  public state!: AlertState;
  public lastValues!: AlertHistoryLastValue[];

  // Timestamps
  public readonly createdAt!: Date;
  // No updatedAt needed if not present in Mongoose schema and not desired
}

AlertHistory.init(
  {
    id: { // Adding a primary key, as it's good practice
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    alertId: { // Foreign key for Alert
      type: DataTypes.UUID,
      allowNull: false,
      // references: { model: 'Alerts', key: 'id' } // Define association later
    },
    counts: {
      type: DataTypes.INTEGER, // INTEGER for counts
      defaultValue: 0,
      allowNull: false,
    },
    state: {
      type: DataTypes.ENUM(...Object.values(AlertState)),
      allowNull: false,
    },
    lastValues: {
      type: DataTypes.JSONB, // Storing array of objects as JSONB
      allowNull: false,
      defaultValue: [],
    },
    // createdAt is automatically handled by Sequelize if timestamps: true (or omitted and defaults to true)
  },
  {
    sequelize: sequelizeInstance,
    modelName: 'AlertHistory',
    timestamps: true, // Enables createdAt and updatedAt. We might only need createdAt.
    updatedAt: false, // Explicitly disable updatedAt if not needed
    indexes: [
      {
        fields: ['alertId', 'createdAt'], // Index similar to { alert: 1, createdAt: -1 }
      },
      // TTL index { createdAt: 1 }, { expireAfterSeconds: ms('30d') / 1000 }
      // Sequelize does not have direct support for TTL indexes like Mongoose.
      // This would typically be handled at the database level (e.g., using a cron job to delete old records)
      // or with database-specific extensions if available.
      // For PostgreSQL, you might use a trigger or a cron job with a DELETE statement.
      // For SQLite, this is more challenging and usually requires application-level logic or a scheduled task.
    ],
  },
);

// Define associations here
// Example:
// AlertHistory.belongsTo(Alert, { foreignKey: 'alertId' });

export default AlertHistory;
