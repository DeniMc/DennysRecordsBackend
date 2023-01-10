import createError from "http-errors";
import { Product } from "../models/products.model.js";

/** ADD A NEW PRODUCT */
export const createProduct = async (req, res, next) => {
	try {
		/** Destructure req.body and check if all required data exist */
		const { title, price, category, image, description } = req.body;
		if (!title || !price || !category) {
			return next(createError(400, "Please provide title, price and category"));
		}

		const newProduct = await Product.create({
			title,
			price,
			category,
			image,
			description,
		});
		res.send({
			message: "create product",
			status: "success",
			data: { product: newProduct },
		});
	} catch (error) {
		next(error);
	}
};

/** GET ALL PRODUCTS */
export const getProducts = async (req, res, next) => {
	try {
		const products = await Product.find();
		if (!products.length) {
			return next(createError(404, "There is no product 😞"));
		}

		res.status(200).send({ message: "data fetched", data: { products } });
	} catch (error) {
		next(error);
	}
};
