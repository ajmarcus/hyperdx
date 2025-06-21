import { createTeam, getTeam, getTeamByApiKey } from '@/controllers/team';
import { clearDBCollections, closeDB, connectDB } from '@/fixtures';

describe('team controller', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterEach(async () => {
    await clearDBCollections();
  });

  afterAll(async () => {
    await closeDB();
  });

  it('createTeam + getTeam', async () => {
    const team = await createTeam({ name: 'My Team' }); // createTeam now returns a Sequelize model instance

    expect(team.name).toBe('My Team');

    // If apiKey is a field managed by Sequelize, it might be set directly or via an update method.
    // Assuming createTeam already sets an apiKey or it's auto-generated.
    // If tests need to *change* an apiKey after creation and persist:
    // team.apiKey = 'customApiKey'; // This would make the instance dirty
    // await team.save(); // This would persist the change

    // For this test, let's assume the apiKey is set/generated during createTeam
    // or that we are testing the retrieval with the existing apiKey.
    // If a specific apiKey is needed for the test after creation, and it's not set by createTeam:
    // await team.update({ apiKey: 'specificTestApiKey' });
    // Or if createTeam doesn't persist it initially and returns an unmanaged object:
    // const createdTeam = await Team.findByPk(team.id); // Fetch the persisted instance first
    // await createdTeam.update({ apiKey: 'specificTestApiKey' });

    // Let's assume createTeam returns a persisted Sequelize instance or an object with its ID.
    // And that apiKey is either known or can be read from the 'team' object.
    const persistedTeam = await getTeam(team.id); // Use team.id (Sequelize default PK)
    expect(persistedTeam).toBeTruthy();
    if (persistedTeam) {
      expect(await getTeamByApiKey(persistedTeam.apiKey)).toBeTruthy();
    } else {
      throw new Error('Test setup failed: persistedTeam is null');
    }
  });
});
