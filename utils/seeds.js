import { Product } from "../models/products.model.js";
import { faker } from "@faker-js/faker";
import { pickRandomElement } from "./helper_functions.js";

export const genSampleProducts = async () => {
	try {
		const prods = await Product.find();
		if (prods.length < 20) {
			const numOfprods = 20 - prods.length;
			const products = [];

			for (let i = 0; i < numOfprods; i++) {
				const newProduct = new Product({
					title: faker.commerce.productName(),
					price: faker.commerce.price(),
					category: pickRandomElement(["men", "women", "kids"]),
					image: faker.image.fashion(),
					description: faker.commerce.productDescription(),
				});

				products.push(newProduct);
			}

			await Product.insertMany(products);
			console.log(`${numOfprods} Sample products added to DB. 😇`);
		}
	} catch (error) {
		console.error(error.message);
	}
};
