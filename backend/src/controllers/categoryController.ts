import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data-source';
import { Category, CategoryType } from '../entities/Category';
import { Transaction } from '../entities/Transaction';
import { AuthRequest } from '../types/express';

function repo() {
  return AppDataSource.getRepository(Category);
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const categories = await repo().findBy({ userId });
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const { name, type } = req.body as { name: string; type: CategoryType };
    const category = repo().create({ userId, name, type });
    await repo().save(category);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const category = await repo().findOneBy({ id: parseInt(req.params.id), userId });
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    const { name, type } = req.body as { name: string; type: CategoryType };
    Object.assign(category, { name, type });
    await repo().save(category);
    res.json(category);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const category = await repo().findOneBy({ id: parseInt(req.params.id), userId });
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    const txnCount = await AppDataSource.getRepository(Transaction).countBy({ categoryId: category.id });
    if (txnCount > 0) {
      res.status(409).json({
        error: `Cannot delete category "${category.name}" — it has ${txnCount} transaction${txnCount === 1 ? '' : 's'} linked to it. Delete or reassign those transactions first.`,
      });
      return;
    }

    await repo().remove(category);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
