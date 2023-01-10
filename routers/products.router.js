import express from 'express';
import { getProducts, createProduct } from '../controllers/products.controller.js';
import { protectRoute, restrictTo } from '../middlewares/auth.middleware.js';


const router = express.Router();

/** create and getAll */
router.route("/")
    .get(protectRoute, getProducts)
    .post(protectRoute, restrictTo('admin'), createProduct);


/** update and delete products */
router.route('/:pid')
    .patch(protectRoute,)
    .delete(protectRoute,);



export default router;