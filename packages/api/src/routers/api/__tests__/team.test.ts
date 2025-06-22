import _ from 'lodash';

import { getLoggedInAgent, getServer } from '@/fixtures';
import TeamInvite from '@/models/teamInvite';
import User from '@/models/user';

describe('team router', () => {
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

  it('GET /team', async () => {
    const { agent } = await getLoggedInAgent(server);

    const resp = await agent.get('/team').expect(200);

    expect(new Date(resp.body.createdAt).toString()).not.toBe('Invalid Date');

    expect(_.omit(resp.body, ['_id', 'apiKey', 'createdAt']))
      .toMatchInlineSnapshot(`
Object {
  "allowedAuthMethods": Array [],
  "name": "fake@deploysentinel.com's Team",
}
`);
  });

  it('GET /team/tags - no tags', async () => {
    const { agent } = await getLoggedInAgent(server);

    const resp = await agent.get('/team/tags').expect(200);

    expect(resp.body.data).toMatchInlineSnapshot(`Array []`);
  });

  it('GET /team/tags', async () => {
    const { agent, team } = await getLoggedInAgent(server);
    await agent
      .post('/dashboards')
      .send({
        name: 'Test',
        tiles: [],
        tags: ['test', 'test'], // make sure we dedupe
      })
      .expect(200);

    await agent.post('/sources').send({
      team: team.id, // Use .id for Sequelize
      kind: 'log',
      name: 'My New Source',
      connection: 'local',
      from: {
        databaseName: 'system',
        tableName: 'query_log',
      },
      timestampValueExpression: 'event_date',
      defaultTableSelectExpression: 'event_date,query',
      id: 'l-1148034466',
    });

    await agent
      .post('/saved-search')
      .send({
        id: '1',
        name: 'Test',
        select: 'SELECT * FROM table',
        where: 'WHERE x = 1',
        source: 'l-1148034466',
        tags: ['test', 'test2'],
      })
      .expect(200);
    const resp = await agent.get('/team/tags').expect(200);
    expect(resp.body.data).toStrictEqual(['test', 'test2']);
  });

  it('GET /team/members', async () => {
    const { agent, team } = await getLoggedInAgent(server);
    // Use Sequelize's create method. teamId is the foreign key.
    // Ensure all required fields for User model are provided (e.g., name, password).
    const user1 = await User.create({
      email: 'user1@example.com',
      name: 'User 1 Name', // Assuming 'name' is a required field
      password: 'password1', // Assuming 'password' is a required field
      teamId: team.id // Use team.id for Sequelize
    });
    const user2 = await User.create({
      email: 'user2@example.com',
      name: 'User 2 Name', // Assuming 'name' is a required field
      password: 'password2', // Assuming 'password' is a required field
      teamId: team.id // Use team.id for Sequelize
    });
    const resp = await agent.get('/team/members').expect(200);

    // Snapshot will change: "_id" -> "id", also values of id will be different (UUIDs)
    // The fields like `hasPasswordAuth` and `isCurrentUser` are added by the endpoint logic.
    // Sorting by a stable key like email can help make snapshots more predictable.
    const sortedData = _.sortBy(resp.body.data, 'email');
    expect(sortedData.map(u => _.omit(u, ['id', 'teamId', 'avatar', 'createdAt', 'updatedAt']))).toMatchInlineSnapshot(`
Array [
  Object {
    "email": "fake@deploysentinel.com",
    "hasPasswordAuth": true,
    "isCurrentUser": true,
    "name": "fake@deploysentinel.com",
  },
  Object {
    "email": "user1@example.com",
    "hasPasswordAuth": false,
    "isCurrentUser": false,
    "name": "User 1 Name",
  },
  Object {
    "email": "user2@example.com",
    "hasPasswordAuth": false,
    "isCurrentUser": false,
    "name": "User 2 Name",
  },
]
`);
  });

  it('POST /team/invitation', async () => {
    const { agent } = await getLoggedInAgent(server);
    const resp = await agent
      .post('/team/invitation')
      .send({
        email: 'user3@example.com',
        name: 'User 3',
      })
      .expect(200);
    // Use Sequelize's findOne with where clause and teamId context
    const teamInvite = await TeamInvite.findOne({
      where: { email: 'user3@example.com', teamId: team.id }
    });
    if (teamInvite == null) {
      throw new Error('TeamInvite not found');
    }
    expect(resp.body.url).toContain(`/join-team?token=${teamInvite.token}`);
  });

  it('GET /team/invitations', async () => {
    const { agent } = await getLoggedInAgent(server);
    await Promise.all([
      agent
        .post('/team/invitation')
        .send({
          email: 'user1@example.com',
          name: 'User 1',
        })
        .expect(200),
      agent
        .post('/team/invitation')
        .send({
          email: 'user2@example.com',
          name: 'User 2',
        })
        .expect(200),
    ]);

    const resp = await agent.get('/team/invitations').expect(200);
    expect(
      resp.body.data.map(i => ({
        email: i.email,
        name: i.name,
      })),
    ).toMatchInlineSnapshot(`
Array [
  Object {
    "email": "user1@example.com",
    "name": "User 1",
  },
  Object {
    "email": "user2@example.com",
    "name": "User 2",
  },
]
`);
  });

  it('DELETE /team/member/:userId', async () => {
    const { agent, team } = await getLoggedInAgent(server);

    const user1 = await User.create({ // Sequelize create
      email: 'user1@example.com',
      name: 'User to delete', // Assuming name is required
      password: 'passworddel', // Assuming password is required
      teamId: team.id,
    });

    await agent.delete(`/team/member/${user1.id}`).expect(200); // Use .id

    const resp2 = await agent.get('/team/members').expect(200);

    expect(resp2.body.data).toHaveLength(1);
  });

  it('DELETE /team/invitation/:teamInviteId', async () => {
    const { agent, team } = await getLoggedInAgent(server);

    const invite = await TeamInvite.create({ // Sequelize create
      email: 'fake_invite@example.com',
      name: 'Fake Invite',
      teamId: team.id, // Use .id for team's PK
      token: 'fake_token_value_to_be_deleted', // Ensure token is unique if model requires
    });

    await agent.delete(`/team/invitation/${invite.id}`).expect(200); // Use .id

    const resp2 = await agent.get('/team/invitations').expect(200);

    expect(resp2.body.data).toHaveLength(0);
  });

  it('PATCH /team/apiKey', async () => {
    const { agent } = await getLoggedInAgent(server);

    const resp = await agent.patch('/team/apiKey').expect(200);

    expect(resp.body.newApiKey.length).toBeGreaterThan(0);
  });
});
