import 'reflect-metadata';
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { AppDataSource } from './config/data-source';
import { User } from './entities/User';
import { Category, CategoryType } from './entities/Category';
import { Transaction, TransactionType } from './entities/Transaction';

async function seed(): Promise<void> {
  await AppDataSource.initialize();
  console.log('Database connected. Seeding...');

  const userRepo = AppDataSource.getRepository(User);
  const catRepo = AppDataSource.getRepository(Category);
  const txnRepo = AppDataSource.getRepository(Transaction);

  let user = await userRepo.findOneBy({ email: 'demo@example.com' });
  if (!user) {
    const passwordHash = await bcrypt.hash('demo1234', 10);
    user = userRepo.create({ name: 'Demo User', email: 'demo@example.com', passwordHash });
    await userRepo.save(user);
    console.log('Created demo user');
  } else {
    console.log('Demo user already exists, refreshing data...');
  }

  await txnRepo.delete({ userId: user.id });
  await catRepo.delete({ userId: user.id });

  const catDefs: Array<{ name: string; type: CategoryType }> = [
    { name: 'Salary', type: CategoryType.INCOME },
    { name: 'Freelance', type: CategoryType.INCOME },
    { name: 'Investments', type: CategoryType.INCOME },
    { name: 'Food & Dining', type: CategoryType.EXPENSE },
    { name: 'Housing', type: CategoryType.EXPENSE },
    { name: 'Transportation', type: CategoryType.EXPENSE },
    { name: 'Entertainment', type: CategoryType.EXPENSE },
    { name: 'Healthcare', type: CategoryType.EXPENSE },
    { name: 'Shopping', type: CategoryType.EXPENSE },
    { name: 'Utilities', type: CategoryType.EXPENSE },
  ];

  const categories = await catRepo.save(
    catDefs.map((c) => catRepo.create({ ...c, userId: user!.id })),
  );
  console.log(`Created ${categories.length} categories`);

  const [salary, freelance, investments, food, housing, transport, entertainment, , shopping, utilities] = categories;

  const now = new Date();
  type TxnData = Omit<Transaction, 'id' | 'createdAt' | 'user' | 'category'>;
  const txns: TxnData[] = [];

  for (let m = 5; m >= 0; m--) {
    const y = now.getFullYear();
    const mo = now.getMonth() - m;
    const d = (n: number) => new Date(y, mo, n).toISOString().split('T')[0];

    txns.push(
      { userId: user.id, categoryId: salary.id, amount: 5500, type: TransactionType.INCOME, description: 'Monthly salary', transactionDate: d(1) },
      { userId: user.id, categoryId: freelance.id, amount: 800 + Math.floor(Math.random() * 400), type: TransactionType.INCOME, description: 'Freelance project', transactionDate: d(10) },
      { userId: user.id, categoryId: investments.id, amount: 200 + Math.floor(Math.random() * 300), type: TransactionType.INCOME, description: 'Dividend income', transactionDate: d(15) },
      { userId: user.id, categoryId: housing.id, amount: 1500, type: TransactionType.EXPENSE, description: 'Rent payment', transactionDate: d(1) },
      { userId: user.id, categoryId: food.id, amount: 180 + Math.floor(Math.random() * 80), type: TransactionType.EXPENSE, description: 'Groceries', transactionDate: d(5) },
      { userId: user.id, categoryId: food.id, amount: 60 + Math.floor(Math.random() * 40), type: TransactionType.EXPENSE, description: 'Restaurant dining', transactionDate: d(12) },
      { userId: user.id, categoryId: transport.id, amount: 80 + Math.floor(Math.random() * 50), type: TransactionType.EXPENSE, description: 'Gas & transit', transactionDate: d(8) },
      { userId: user.id, categoryId: utilities.id, amount: 120 + Math.floor(Math.random() * 30), type: TransactionType.EXPENSE, description: 'Electricity & internet', transactionDate: d(3) },
      { userId: user.id, categoryId: entertainment.id, amount: 50 + Math.floor(Math.random() * 50), type: TransactionType.EXPENSE, description: 'Streaming & games', transactionDate: d(20) },
      { userId: user.id, categoryId: shopping.id, amount: 100 + Math.floor(Math.random() * 150), type: TransactionType.EXPENSE, description: 'Online shopping', transactionDate: d(18) },
    );
  }

  await txnRepo.save(txns.map((t) => txnRepo.create(t)));
  console.log(`Created ${txns.length} transactions`);
  console.log('\nSeed complete! Demo login: demo@example.com / demo1234');

  await AppDataSource.destroy();
}

seed().catch((e) => { console.error(e); process.exit(1); });
