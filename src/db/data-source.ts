import { DataSource } from 'typeorm';
import { User } from '../users/domain/entities/user.entity';
import { Favorite } from '../movies/domain/entities/favorite.entity';
import { WatchHistory } from '../movies/domain/entities/history.entity';
import 'dotenv/config';

export const AppDataSource = new DataSource({
  type: (process.env.DB_TYPE as any) || 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_DATABASE || 'ezmovie',
  synchronize: false,
  logging: true,
  entities: [User, Favorite, WatchHistory],
  migrations: [__dirname + '/migrations/*.ts'],
  subscribers: [],
});
