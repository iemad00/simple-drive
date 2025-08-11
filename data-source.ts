import 'dotenv/config';
import { DataSource } from 'typeorm';
import { typeormOptions } from './src/config/typeorm.config';

export default new DataSource({
  ...(typeormOptions as any),
});
