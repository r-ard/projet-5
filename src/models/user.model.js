const Mongoose = require('mongoose');
const UniquePlugin = require('mongoose-unique-validator');

const UserSchema = Mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        required: true
    }
});
UserSchema.plugin(UniquePlugin);

const User = Mongoose.model('user', UserSchema);
module.exports = User;