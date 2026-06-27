import { Router } from 'express';
import { list, create, update, remove } from '../controllers/transactionController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { transactionSchema } from '../validators/transaction';

const router = Router();
router.use(authenticate);

router.get('/', list);
router.post('/', validate(transactionSchema), create);
router.put('/:id', validate(transactionSchema), update);
router.delete('/:id', remove);

export default router;
