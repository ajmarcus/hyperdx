import { SourceKind } from '@hyperdx/common-utils/dist/types';
// import { Types } from 'mongoose'; // Remove Mongoose specific import
import { v4 as uuidv4 } from 'uuid'; // For generating UUIDs if needed for mock connectionId

import { getLoggedInAgent, getServer } from '@/fixtures';
import Source from '@/models/source'; // Now a Sequelize model

const MOCK_SOURCE = {
  kind: SourceKind.Log,
  name: 'Test Source',
  // connectionId should ideally be a valid UUID if it's a FK to a Connection table using UUIDs.
  // For now, using a generated UUID. This mock might need a corresponding Connection record in DB for full validity.
  connectionId: uuidv4(),
  from: {
    databaseName: 'test_db',
    tableName: 'test_table',
  },
  timestampValueExpression: 'timestamp',
};

describe('sources router', () => {
  const server = getServer();

  beforeAll(async () => {
    await server.start();
  });

  afterEach(async () => {
    await server.clearDBs();
  });

  afterAll(async () => {
    await server.stop();
  });

  it('GET / - returns all sources for a team', async () => {
    const { agent, team } = await getLoggedInAgent(server);

    // Create test source using Sequelize syntax
    await Source.create({
      ...MOCK_SOURCE, // Spread the mock, ensure connectionId is included if not already
      teamId: team.id, // Use teamId and team.id
    });

    const response = await agent.get('/sources').expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({
      kind: MOCK_SOURCE.kind,
      name: MOCK_SOURCE.name,
      from: MOCK_SOURCE.from,
      timestampValueExpression: MOCK_SOURCE.timestampValueExpression,
    });
  });

  it('GET / - returns empty array when no sources exist', async () => {
    const { agent } = await getLoggedInAgent(server);

    const response = await agent.get('/sources').expect(200);

    expect(response.body).toEqual([]);
  });

  it('POST / - creates a new source', async () => {
    const { agent } = await getLoggedInAgent(server);

    const response = await agent.post('/sources').send(MOCK_SOURCE).expect(200);

    expect(response.body).toMatchObject({
      kind: MOCK_SOURCE.kind,
      name: MOCK_SOURCE.name,
      from: MOCK_SOURCE.from,
      timestampValueExpression: MOCK_SOURCE.timestampValueExpression,
    });

    // Verify source was created in database using Sequelize syntax
    const sources = await Source.findAll({});
    expect(sources).toHaveLength(1);
  });

  it('POST / - returns 400 when request body is invalid', async () => {
    const { agent } = await getLoggedInAgent(server);

    // Missing required fields
    await agent
      .post('/sources')
      .send({
        kind: SourceKind.Log,
        name: 'Test Source',
      })
      .expect(400);
  });

  it('PUT /:id - updates an existing source', async () => {
    const { agent, team } = await getLoggedInAgent(server);

    // Create test source using Sequelize syntax
    const source = await Source.create({
      ...MOCK_SOURCE,
      teamId: team.id, // Use teamId and team.id
    });

    const updatedSourceData = {
      // Prepare data for update
      ...MOCK_SOURCE, // Include other fields from MOCK_SOURCE that are part of the update
      name: 'Updated Name',
      // id: source.id, // id is usually not sent in body for PUT, it's in URL
      // teamId: team.id // teamId typically shouldn't change or is handled by API
    };

    await agent
      .put(`/sources/${source.id}`)
      .send(updatedSourceData)
      .expect(200); // Use source.id

    // Verify source was updated using Sequelize syntax
    const updatedSourceFromDB = await Source.findByPk(source.id); // Use findByPk and source.id
    expect(updatedSourceFromDB?.name).toBe('Updated Name');
  });

  it('PUT /:id - returns 404 when source does not exist', async () => {
    const { agent } = await getLoggedInAgent(server);

    const nonExistentId = uuidv4(); // Use UUID for ID

    await agent
      .put(`/sources/${nonExistentId}`)
      .send({
        // Send a valid source body structure for an update attempt
        ...MOCK_SOURCE,
        name: 'Trying to update non-existent',
        // id: nonExistentId, // Not typically in body
      })
      .expect(404);
  });

  it('DELETE /:id - deletes a source', async () => {
    const { agent, team } = await getLoggedInAgent(server);

    // Create test source using Sequelize syntax
    const source = await Source.create({
      ...MOCK_SOURCE,
      teamId: team.id, // Use teamId and team.id
    });

    await agent.delete(`/sources/${source.id}`).expect(200); // Use source.id

    // Verify source was deleted using Sequelize syntax
    const deletedSource = await Source.findByPk(source.id); // Use findByPk and source.id
    expect(deletedSource).toBeNull();
  });

  it('DELETE /:id - returns 200 when source does not exist', async () => {
    const { agent } = await getLoggedInAgent(server);

    const nonExistentId = uuidv4(); // Use UUID for ID

    // This will succeed even if the ID doesn't exist, consistent with the implementation
    await agent.delete(`/sources/${nonExistentId}`).expect(200);
  });
});
