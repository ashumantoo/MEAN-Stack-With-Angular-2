const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

let titleLengthChecker = (title) => {
    if (!title) {
        return false;
    } else {
        if (title.length < 5 || title.length > 50) {
            return false;
        } else {
            return true;
        }
    }
};

let alphaNumericTitleChecker = (title) => {
    if (!title) {
        return false;
    } else {
        const regExp = new RegExp(/^[a-zA-Z0-9 ]+$/);
        return regExp.test(title);
    }
};

let bodyLengthChecker = (body) => {
    if (!body) {
        return false;
    } else {
        if (body.length < 5 || body.length > 500) {
            return false;
        } else {
            return true;
        }
    }
};

let commentLengthChecker = (comment) => {
    if (!comment[0]) {
        return false;
    } else {
        if (comment[0].length < 1 || comment[0].length > 200) {
            return false;
        } else {
            return true;
        }
    }
}

const titleValidators = [
    {
        validator: titleLengthChecker,
        message: "Post title must be more than 5 character but not more than 50 characeters"
    },
    {
        validator: alphaNumericTitleChecker,
        message: "Post title must contains only alphabates and numbers"
    }
];

const bodyValidators = [
    {
        validator: bodyLengthChecker,
        message: "Post body must be more than 5 characeters but not more than 500 characters"
    }
];

const commentValidators = [
    {
        validator: commentLengthChecker,
        message: "Post body must be more than 1 characeters but not more than 200 characters"
    }
];

const BlogSchema = new Schema({
    title: {
        type: String,
        required: true,
        validate: titleValidators
    },
    body: {
        type: String,
        required: true,
        validate: bodyValidators
    },
    createdBy: {
        type: String
    },
    createAt: {
        type: Date,
        default: Date.now()
    },
    likes: {
        type: Number,
        default: 0
    },
    likedBy: {
        type: Array
    },
    dislikes: {
        type: Number,
        default: 0
    },
    dislikedBy: {
        type: Array
    },
    comments: [
        {
            comment: {
                type: String,
                validate: commentValidators
            },
            commentator: {
                type: String
            }
        }
    ]
});

module.exports = mongoose.model('Blog', BlogSchema);