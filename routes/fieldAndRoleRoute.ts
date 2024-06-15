
import express from 'express'
import { getFieldAndRole, addFieldAndRole } from '../controllers/fieldAndRoleController';
// import { isAuthenticated } from '../middlewares/isAuth';

const router = express.Router();

router.get('/getFieldAndRole', getFieldAndRole);
router.post('/addFieldAndRole', addFieldAndRole);

export default router;
