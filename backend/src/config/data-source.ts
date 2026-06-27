import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Category } from '../entities/Category';
import { Transaction } from '../entities/Transaction';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'finance_tracker',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  synchronize: process.env.NODE_ENV !== 'production' || process.env.TYPEORM_SYNC === 'true',
  logging: false,
  entities: [User, Category, Transaction],
  migrations: [],
});
