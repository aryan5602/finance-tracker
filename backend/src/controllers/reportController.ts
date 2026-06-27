import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data-source';
import { Transaction } from '../entities/Transaction';
import { AuthRequest } from '../types/express';

function repo() {
  return AppDataSource.getRepository(Transaction);
}

export async function summary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

    const qb = repo()
      .createQueryBuilder('t')
      .select('t.type', 'type')
      .addSelect('SUM(CAST(t.amount AS NUMERIC))', 'total')
      .where('t.userId = :userId', { userId })
      .groupBy('t.type');

    if (startDate) qb.andWhere('t.transactionDate >= :startDate', { startDate });
    if (endDate) qb.andWhere('t.transactionDate <= :endDate', { endDate });

    const rows = await qb.getRawMany<{ type: string; total: string }>();

    let totalIncome = 0;
    let totalExpense = 0;
    for (const row of rows) {
      if (row.type === 'income') totalIncome = parseFloat(row.total) || 0;
      if (row.type === 'expense') totalExpense = parseFloat(row.total) || 0;
    }

    res.json({ totalIncome, totalExpense, netBalance: totalIncome - totalExpense });
  } catch (err) {
    next(err);
  }
}

export async function byCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const { startDate, endDate, type } = req.query as {
      startDate?: string;
      endDate?: string;
      type?: string;
    };

    const qb = repo()
      .createQueryBuilder('t')
      .innerJoin('t.category', 'c')
      .select('c.id', 'categoryId')
      .addSelect('c.name', 'categoryName')
      .addSelect('t.type', 'type')
      .addSelect('SUM(CAST(t.amount AS NUMERIC))', 'total')
      .where('t.userId = :userId', { userId })
      .groupBy('c.id')
      .addGroupBy('c.name')
      .addGroupBy('t.type')
      .orderBy('total', 'DESC');

    if (startDate) qb.andWhere('t.transactionDate >= :startDate', { startDate });
    if (endDate) qb.andWhere('t.transactionDate <= :endDate', { endDate });
    if (type) qb.andWhere('t.type = :type', { type });

    const rows = await qb.getRawMany<{
      categoryId: number;
      categoryName: string;
      type: string;
      total: string;
    }>();

    res.json(
      rows.map((r) => ({
        categoryId: r.categoryId,
        categoryName: r.categoryName,
        type: r.type,
        total: parseFloat(r.total) || 0,
      })),
    );
  } catch (err) {
    next(err);
  }
}
