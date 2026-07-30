import { Router } from 'express';
import * as propertyController from '../controllers/propertyController.js';
import { authenticateToken } from '../middleware/auth.js';
const router = Router();
router.get('/search', propertyController.searchProperties);
router.post('/fit/matches', propertyController.getPropertyFitMatches);
router.post('/fit/lead', propertyController.createOrLoginPropertyFitLead);
router.post('/fit/view', propertyController.notifyPropertyFitView);
router.get('/', propertyController.getAllProperties);
router.get('/my-properties', authenticateToken, propertyController.getUserProperties);
router.get('/:id', propertyController.getPropertyById);
router.post('/:id/view', propertyController.recordPropertyView);
router.post('/', authenticateToken, propertyController.createProperty);
router.put('/:id', authenticateToken, propertyController.updateProperty);
router.patch('/:id', authenticateToken, propertyController.updateProperty);
router.delete('/:id', authenticateToken, propertyController.deleteProperty);
export default router;
//# sourceMappingURL=propertyRoutes.js.map