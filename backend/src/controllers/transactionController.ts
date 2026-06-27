import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data-source';
import { Transaction, TransactionType } from '../entities/Transaction';
import { Category } from '../entities/Category';
import { AuthRequest } from '../types/express';

function repo() {
  return AppDataSource.getRepository(Transaction);
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const { page = '1', limit = '20', category, type, startDate, endDate, sort = 'DESC' } =
      req.query as Record<string, string>;

    const qb = repo()
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.category', 'c')
      .where('t.userId = :userId', { userId })
      .orderBy('t.transactionDate', sort.toUpperCase() === 'ASC' ? 'ASC' : 'DESC')
      .addOrderBy('t.id', 'DESC');

    if (category) qb.andWhere('t.categoryId = :category', { category: parseInt(category) });
    if (type) qb.andWhere('t.type = :type', { type });
    if (startDate) qb.andWhere('t.transactionDate >= :startDate', { startDate });
    if (endDate) qb.andWhere('t.transactionDate <= :endDate', { endDate });

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const [data, total] = await qb
      .skip((pageNum - 1) * limitNum)
      .take(limitNum)
      .getManyAndCount();

    res.json({
      data,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const { categoryId, amount, type, description, transactionDate } = req.body as {
      categoryId: number;
      amount: number;
      type: TransactionType;
      description?: string | null;
      transactionDate: string;
    };

    const category = await AppDataSource.getRepository(Category).findOneBy({ id: categoryId, userId });
    if (!category) {
      res.status(400).json({ error: 'Category not found or does not belong to user' });
      return;
    }

    const transaction = repo().create({ userId, categoryId, amount, type, description, transactionDate });
    await repo().save(transaction);

    const saved = await repo().findOne({ where: { id: transaction.id }, relations: ['category'] });
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const transaction = await repo().findOneBy({ id: parseInt(req.params.id), userId });
    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    const { categoryId, amount, type, description, transactionDate } = req.body as {
      categoryId: number;
      amount: number;
      type: TransactionType;
      description?: string | null;
      transactionDate: string;
    };

    if (categoryId && categoryId !== transaction.categoryId) {
      const category = await AppDataSource.getRepository(Category).findOneBy({ id: categoryId, userId });
      if (!category) {
        res.status(400).json({ error: 'Category not found or does not belong to user' });
        return;
      }
    }

    Object.assign(transaction, { categoryId, amount, type, description, transactionDate });
    await repo().save(transaction);

    const saved = await repo().findOne({ where: { id: transaction.id }, relations: ['category'] });
    res.json(saved);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const transaction = await repo().findOneBy({ id: parseInt(req.params.id), userId });
    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }
    await repo().remove(transaction);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
