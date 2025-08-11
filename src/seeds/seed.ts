import appDataSource from '../../data-source';
import { seedRbac } from './rbac.seeder';

async function runSeed() {
  const dataSource = await appDataSource.initialize();
  console.log('Running seeders...');
  await seedRbac(dataSource);
  await dataSource.destroy();
  console.log('Seeding complete');
}

runSeed().catch((err) => {
  console.error('Seeding failed', err);
  process.exit(1);
});
