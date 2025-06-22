import { DataTypes, Model } from 'sequelize';
import { sequelizeInstance } from './index';
import {
  MetricsDataType,
  SourceKind,
} from '@hyperdx/common-utils/dist/types'; // Assuming these enums are available

// import Team from './team'; // For associations
// import Connection from './connection'; // For associations

interface FromObject {
  databaseName?: string;
  tableName?: string;
}

interface MetricTablesObject {
  [MetricsDataType.Gauge]?: string;
  [MetricsDataType.Histogram]?: string;
  [MetricsDataType.Sum]?: string;
  [MetricsDataType.Summary]?: string;
  [MetricsDataType.ExponentialHistogram]?: string;
}

class Source extends Model {
  public id!: string; // Assuming a UUID primary key
  public kind!: SourceKind;
  public teamId!: string; // Foreign key to Team
  public connectionId!: string; // Foreign key to Connection, Mongoose schema has it as ObjectId | string, but foreign keys are typically uniform

  public from?: FromObject;
  public timestampValueExpression?: string;
  public name?: string;
  public displayedTimestampValueExpression?: string;
  public implicitColumnExpression?: string;
  public serviceNameExpression?: string;
  public bodyExpression?: string;
  public tableFilterExpression?: string;
  public eventAttributesExpression?: string;
  public resourceAttributesExpression?: string;
  public defaultTableSelectExpression?: string;
  public uniqueRowIdExpression?: string;
  public severityTextExpression?: string;
  public traceIdExpression?: string;
  public spanIdExpression?: string;
  public traceSourceId?: string;
  public sessionSourceId?: string;
  public metricSourceId?: string;
  public durationExpression?: string;
  public durationPrecision?: number;
  public parentSpanIdExpression?: string;
  public spanNameExpression?: string;
  public logSourceId?: string;
  public spanKindExpression?: string;
  public statusCodeExpression?: string;
  public statusMessageExpression?: string;
  public spanEventsValueExpression?: string;
  public metricTables?: MetricTablesObject;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Source.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    kind: {
      type: DataTypes.ENUM(...Object.values(SourceKind)),
      allowNull: false,
    },
    teamId: {
      type: DataTypes.UUID,
      allowNull: false,
      // references: { model: 'Teams', key: 'id' },
    },
    connectionId: {
      type: DataTypes.UUID,
      allowNull: false,
      // references: { model: 'Connections', key: 'id' },
    },
    from: {
      type: DataTypes.JSONB, // For embedded object
      allowNull: true,
    },
    timestampValueExpression: { type: DataTypes.STRING, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: true },
    displayedTimestampValueExpression: { type: DataTypes.STRING, allowNull: true },
    implicitColumnExpression: { type: DataTypes.STRING, allowNull: true },
    serviceNameExpression: { type: DataTypes.STRING, allowNull: true },
    bodyExpression: { type: DataTypes.TEXT, allowNull: true }, // TEXT for potentially long expressions
    tableFilterExpression: { type: DataTypes.TEXT, allowNull: true },
    eventAttributesExpression: { type: DataTypes.TEXT, allowNull: true },
    resourceAttributesExpression: { type: DataTypes.TEXT, allowNull: true },
    defaultTableSelectExpression: { type: DataTypes.TEXT, allowNull: true },
    uniqueRowIdExpression: { type: DataTypes.STRING, allowNull: true },
    severityTextExpression: { type: DataTypes.STRING, allowNull: true },
    traceIdExpression: { type: DataTypes.STRING, allowNull: true },
    spanIdExpression: { type: DataTypes.STRING, allowNull: true },
    traceSourceId: { type: DataTypes.UUID, allowNull: true }, // Assuming it's a UUID if it refers to another source ID
    sessionSourceId: { type: DataTypes.UUID, allowNull: true },
    metricSourceId: { type: DataTypes.UUID, allowNull: true },
    durationExpression: { type: DataTypes.STRING, allowNull: true },
    durationPrecision: { type: DataTypes.INTEGER, allowNull: true },
    parentSpanIdExpression: { type: DataTypes.STRING, allowNull: true },
    spanNameExpression: { type: DataTypes.STRING, allowNull: true },
    logSourceId: { type: DataTypes.UUID, allowNull: true },
    spanKindExpression: { type: DataTypes.STRING, allowNull: true },
    statusCodeExpression: { type: DataTypes.STRING, allowNull: true },
    statusMessageExpression: { type: DataTypes.STRING, allowNull: true },
    spanEventsValueExpression: { type: DataTypes.TEXT, allowNull: true },
    metricTables: {
      type: DataTypes.JSONB, // For the key-value object
      allowNull: true,
    },
  },
  {
    sequelize: sequelizeInstance,
    modelName: 'Source',
    timestamps: true,
  },
);

// Define associations
// Source.belongsTo(Team, { foreignKey: 'teamId' });
// Source.belongsTo(Connection, { foreignKey: 'connectionId' });

export default Source;
