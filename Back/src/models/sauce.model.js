const Mongoose = require('mongoose');

const SauceSchema = Mongoose.Schema({
    userId: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    name: {
        type: String
    },
    manufacturer: {
        type: String
    },
    description: {
        type: String
    },
    mainPepper: {
        type: String
    },
    imageUrl: {
        type: String
    },
    heat: {
        type: Number
    },
    likes: {
        type: Number
    },
    dislikes: {
        type: Number
    },
    usersLiked: [
        {
            type: Mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    ],
    usersDisliked: [
        {
            type: Mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    ]
});

const Sauce = Mongoose.model('sauce', SauceSchema);
module.exports = Sauce;