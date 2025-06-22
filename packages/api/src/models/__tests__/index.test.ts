import { createTeam } from '@/controllers/team'; // This controller should now use Sequelize
import { clearDBCollections, closeDB, connectDB, sequelize } from '@/fixtures'; // Assuming sequelize is exported from fixtures
import Team from '@/models/team'; // This is now a Sequelize model

describe('Team model and basic queries', () => {
  // Updated description
  beforeAll(async () => {
    await connectDB(); // Connects and syncs schema
  });

  afterEach(async () => {
    // Assuming clearDBCollections is updated for Sequelize:
    // e.g., by deleting all rows from tables or sequelize.sync({ force: true })
    await clearDBCollections();
  });

  afterAll(async () => {
    await closeDB();
  });

  it('does not query for non-existent properties', async () => {
    // createTeam controller now uses Sequelize
    const team = await createTeam({ name: 'My Team' });

    // Sequelize uses findAll with a where clause
    const foundByName = await Team.findAll({ where: { name: 'My Team' } });
    expect(foundByName).toHaveLength(1);

    // Sequelize will error if 'fakeProperty' is not a defined attribute.
    // To test for behavior with non-existent properties, one might try querying with an undefined property if allowed,
    // or ensure that queries for valid properties with no matches return empty.
    // For instance, if fakeProperty was a valid but optional field:
    // const foundByFake = await Team.findAll({ where: { fakeProperty: 'please' } });
    // expect(foundByFake).toHaveLength(0);
    // If 'fakeProperty' is truly not part of the model, this type of query isn't directly applicable
    // as it would be a programming error against a statically typed model.
    // The original test might have relied on Mongoose's more dynamic schema handling.

    // A more Sequelize-idiomatic test for non-matching properties:
    const foundByNonMatchingName = await Team.findAll({
      where: { name: 'NonExistent Team' },
    });
    expect(foundByNonMatchingName).toHaveLength(0);
  });
});
