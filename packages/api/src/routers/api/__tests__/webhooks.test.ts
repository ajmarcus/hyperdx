// import { Types } from 'mongoose'; // Remove Mongoose specific import
import { v4 as uuidv4 } from 'uuid'; // For generating UUIDs

import { getLoggedInAgent, getServer } from '@/fixtures';
import Webhook, { WebhookService } from '@/models/webhook'; // Now a Sequelize model

const MOCK_WEBHOOK = {
  name: 'Test Webhook',
  service: WebhookService.Slack,
  url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
  description: 'Test webhook for Slack',
  queryParams: { param1: 'value1' },
  headers: { 'X-Custom-Header': 'Header Value' },
  body: '{"text": "Test message"}',
};

describe('webhooks router', () => {
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

  it('GET / - returns webhooks filtered by service', async () => {
    const { agent, team } = await getLoggedInAgent(server);

    // Create test webhook using Sequelize syntax
    await Webhook.create({
      ...MOCK_WEBHOOK,
      teamId: team.id, // Use teamId and team.id
    });

    // Create a webhook for a different service
    await Webhook.create({
      ...MOCK_WEBHOOK,
      service: WebhookService.Generic,
      url: 'https://example.com/webhook/generic',
      teamId: team.id, // Use teamId and team.id
    });

    // Get webhooks for Slack
    const response = await agent
      .get('/webhooks')
      .query({ service: WebhookService.Slack })
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      name: MOCK_WEBHOOK.name,
      service: MOCK_WEBHOOK.service,
      url: MOCK_WEBHOOK.url,
    });

    // Get webhooks for multiple services
    const multiResponse = await agent
      .get('/webhooks')
      .query({ service: [WebhookService.Slack, WebhookService.Generic] })
      .expect(200);

    expect(multiResponse.body.data).toHaveLength(2);
  });

  it('GET / - returns empty array when no webhooks exist', async () => {
    const { agent } = await getLoggedInAgent(server);

    const response = await agent
      .get('/webhooks')
      .query({ service: WebhookService.Slack })
      .expect(200);

    expect(response.body.data).toEqual([]);
  });

  it('POST / - creates a new webhook', async () => {
    const { agent } = await getLoggedInAgent(server);

    const response = await agent
      .post('/webhooks')
      .send(MOCK_WEBHOOK)
      .expect(200);

    expect(response.body.data).toMatchObject({
      name: MOCK_WEBHOOK.name,
      service: MOCK_WEBHOOK.service,
      url: MOCK_WEBHOOK.url,
      description: MOCK_WEBHOOK.description,
    });

    // Verify webhook was created in database using Sequelize syntax
    const webhooks = await Webhook.findAll({});
    expect(webhooks).toHaveLength(1);
  });

  it('POST / - returns 400 when webhook with same URL already exists', async () => {
    const { agent, team } = await getLoggedInAgent(server);

    // Create webhook first using Sequelize syntax
    await Webhook.create({
      ...MOCK_WEBHOOK,
      teamId: team.id, // Use teamId and team.id
    });

    // Try to create the same webhook again
    const response = await agent
      .post('/webhooks')
      .send(MOCK_WEBHOOK)
      .expect(400);

    expect(response.body.message).toBe('Webhook already exists');

    // Verify only one webhook exists using Sequelize syntax
    const webhooks = await Webhook.findAll({});
    expect(webhooks).toHaveLength(1);
  });

  it('POST / - returns 400 when request body is invalid', async () => {
    const { agent } = await getLoggedInAgent(server);

    // Missing required fields
    await agent
      .post('/webhooks')
      .send({
        name: 'Invalid Webhook',
      })
      .expect(400);

    // Invalid URL
    await agent
      .post('/webhooks')
      .send({
        ...MOCK_WEBHOOK,
        url: 'not-a-url',
      })
      .expect(400);

    // Invalid service
    await agent
      .post('/webhooks')
      .send({
        ...MOCK_WEBHOOK,
        service: 'INVALID_SERVICE',
      })
      .expect(400);
  });

  it('DELETE /:id - deletes a webhook', async () => {
    const { agent, team } = await getLoggedInAgent(server);

    // Create test webhook using Sequelize syntax
    const webhook = await Webhook.create({
      ...MOCK_WEBHOOK,
      teamId: team.id, // Use teamId and team.id
    });

    await agent.delete(`/webhooks/${webhook.id}`).expect(200); // Use webhook.id

    // Verify webhook was deleted using Sequelize syntax
    const deletedWebhook = await Webhook.findByPk(webhook.id); // Use findByPk and webhook.id
    expect(deletedWebhook).toBeNull();
  });

  it('DELETE /:id - returns 200 when webhook does not exist', async () => {
    const { agent } = await getLoggedInAgent(server);

    const nonExistentId = uuidv4(); // Use UUID for ID

    // This will succeed even if the ID doesn't exist, consistent with the implementation
    await agent.delete(`/webhooks/${nonExistentId}`).expect(200);
  });

  it('DELETE /:id - returns 400 when ID is invalid', async () => {
    const { agent } = await getLoggedInAgent(server);

    await agent.delete('/webhooks/invalid-id').expect(400);
  });
});
