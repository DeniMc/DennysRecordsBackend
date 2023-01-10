import { model, Schema } from 'mongoose';

const tokenSchema = new Schema({
    token: {
        type: String,
        required: [true, 'Verification token is required']
    },
    userid: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'The id of token\'s owner is required']
    }
});

export const Token = model('Token', tokenSchema);
