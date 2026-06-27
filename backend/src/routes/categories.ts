import { Router } from 'express';
import { list, create, update, remove } from '../controllers/categoryController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { categorySchema } from '../validators/category';

const router = Router();
router.use(authenticate);

router.get('/', list);
router.post('/', validate(categorySchema), create);
router.put('/:id', validate(categorySchema), update);
router.delete('/:id', remove);

export default router;
