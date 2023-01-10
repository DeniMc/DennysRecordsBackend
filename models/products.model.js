import { model, Schema } from 'mongoose';

/* -------------- Product Schema -------------- */
const productSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Please provide product title'],
    },

    price: {
        type: Number,
        required: [true, 'Please provide a price'],
        validate: {
            validator: function () {
                return this.price >= 0
            },
            message: 'Please provide a valid price'
        }
    },

    category: {
        type: String,
        required: [true, 'Please provide the category of product'],
        enum: {
            values: ['men', 'women', 'kids'],
            message: 'Please enter a valid category. e.g men, women, kids',
        },
        trim: true,
        lowercase: true
    },

    image: {
        type: String,
    },

    description: {
        type: String
    }
})


export const Product = model('Product', productSchema);