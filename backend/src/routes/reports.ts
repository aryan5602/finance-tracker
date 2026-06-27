import { Router } from 'express';
import { summary, byCategory } from '../controllers/reportController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/summary', summary);
router.get('/by-category', byCategory);

export default router;
