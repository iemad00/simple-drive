import 'dotenv/config';
import { DataSource } from 'typeorm';
import { typeormOptions } from './src/config/typeorm.config';

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
const appDataSource = new DataSource(typeormOptions as any);
export default appDataSource;
