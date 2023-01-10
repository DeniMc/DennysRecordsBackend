import mongoose from "mongoose";
import dotenv from "dotenv";
import { genSampleProducts } from "./seeds.js"
dotenv.config();

export const connectToDB = async () => {
	try {
		mongoose.set("strictQuery", true);
		await mongoose.connect(process.env.DB_LINK);
		console.log(`Connection to DB established. 🌻`);

		/** SEEDING */
		genSampleProducts();
	} catch (error) {}
};
