import {
  getLoggedInAgent,
  getServer,
  makeAlertInput,
  makeTile,
  randomMongoId,
} from '@/fixtures';

const MOCK_TILES = [makeTile(), makeTile(), makeTile(), makeTile(), makeTile()];

const MOCK_DASHBOARD = {
  id: randomMongoId(),
  name: 'Test Dashboard',
  tiles: MOCK_TILES,
  tags: ['test'],
};

describe('alerts router', () => {
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

  it('can create an alert', async () => {
    const { agent } = await getLoggedInAgent(server);
    const dashboard = await agent
      .post('/dashboards')
      .send(MOCK_DASHBOARD)
      .expect(200);
    const alert = await agent
      .post('/alerts')
      .send(
        makeAlertInput({
          dashboardId: dashboard.body.id,
          tileId: dashboard.body.tiles[0].id,
        }),
      )
      .expect(200);
    expect(alert.body.data.dashboard).toBe(dashboard.body.id);
    expect(alert.body.data.tileId).toBe(dashboard.body.tiles[0].id);
  });

  it('can delete an alert', async () => {
    const { agent } = await getLoggedInAgent(server);
    const resp = await agent
      .post('/dashboards')
      .send(MOCK_DASHBOARD)
      .expect(200);
    const alert = await agent
      .post('/alerts')
      .send(
        makeAlertInput({
          dashboardId: resp.body.id,
          tileId: MOCK_TILES[0].id,
        }),
      )
      .expect(200);
    await agent.delete(`/alerts/${alert.body.data.id}`).expect(200); // Use .id
    const alerts = await agent.get('/alerts').expect(200);
    expect(alerts.body.data.length).toBe(0);
  });

  it('can update an alert', async () => {
    const { agent } = await getLoggedInAgent(server);
    const dashboard = await agent
      .post('/dashboards')
      .send(MOCK_DASHBOARD)
      .expect(200);
    const alert = await agent
      .post('/alerts')
      .send(
        makeAlertInput({
          dashboardId: dashboard.body.id,
          tileId: MOCK_TILES[0].id,
        }),
      )
      .expect(200);
    await agent
      .put(`/alerts/${alert.body.data.id}`) // Use .id
      .send({
        ...alert.body.data, // Spread the existing alert data
        // Ensure dashboardId is correctly sourced if alert.body.data.dashboard is an object
        dashboardId: dashboard.body.id,
        threshold: 10,
      })
      .expect(200);
    const allAlerts = await agent.get(`/alerts`).expect(200);
    expect(allAlerts.body.data.length).toBe(1);
    expect(allAlerts.body.data[0].threshold).toBe(10);
  });

  it('has alerts attached to dashboards', async () => {
    const { agent } = await getLoggedInAgent(server);

    await agent.post('/dashboards').send(MOCK_DASHBOARD).expect(200);
    const initialDashboards = await agent.get('/dashboards').expect(200);

    // Create alerts for all charts
    const dashboard = initialDashboards.body[0];
    await Promise.all(
      dashboard.tiles.map(tile =>
        agent
          .post('/alerts')
          .send(
            makeAlertInput({
              dashboardId: dashboard.id, // Use .id
              tileId: tile.id,
            }),
          )
          .expect(200),
      ),
    );

    const alerts = await agent.get(`/alerts`).expect(200);
    expect(alerts.body.data.length).toBe(5);
    for (const alert of alerts.body.data) {
      expect(alert.tileId).toBeDefined();
      expect(alert.dashboard).toBeDefined();
    }
  });
});
