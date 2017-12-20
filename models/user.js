const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

let emailLengthChecker = (email) => {
    if (!email) {
        return false;
    } else {
        if (email.length < 5 || email.length > 30) {
            return false;
        } else {
            return true;
        }
    }
};

let validEmailChecker = (email) => {
    if (!email) {
        return false;
    } else {
        const regExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
        return regExp.test(email);
    }
};

let usernameLengthChecker = (username) => {
    if (!username) {
        return false;
    } else {
        if (username.length < 3 || username.length > 20) {
            return false
        } else {
            return true;
        }
    }
};

let validUsernameCheck = (username) => {
    if (!username) {
        return false;
    } else {
        const regExp = new RegExp(/^[a-zA-Z0-9]+$/);
        return regExp.test(username);
    }
};

let passwordLenthChecker = (password) => {
    if (!password) {
        return false;
    } else {
        if (password.length < 8 || password.length > 35) {
            return false;
        } else {
            return true;
        }
    }
};

let validPasswordChecker = (password) => {
    if (!password) {
        return false;
    } else {
        const regExp = new RegExp(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d])(?=.*?[\W]).{8,35}$/);
        return regExp.test(password);
    }
};

const emailValidators = [
    {
        validator: emailLengthChecker,
        message: 'E-mail must be more then 5 character and less than 30 character!'
    },
    {
        validator: validEmailChecker,
        message: 'Must be a valid e-mail'
    }
];

const usernameValidators = [
    {
        validator: usernameLengthChecker,
        message: "Username must not be less than 3 character and more than 20 charcter!"
    },
    {
        validator: validUsernameCheck,
        message: "Username contains only alphabates and numbers!"
    }
];

const passwordValidators = [
    {
        validator: passwordLenthChecker,
        message: "password must be more than 8 character and less than 35 charcter!"
    },
    {
        validator: validPasswordChecker,
        message: "password must contain uppercase ,lowercase, numbers,character and special character!"
    }
];

const UserSchema = new Schema({
    email: { type: String, required: true, unique: true, validate: emailValidators },
    username: { type: String, required: true, unique: true, validate: usernameValidators },
    password: { type: String, required: true ,validate : passwordValidators},
});

UserSchema.pre('save', function (next) {
    if (!this.isModified('password'))
        return next();

    bcrypt.hash(this.password, null, null, (err, hash) => {
        if (err) return next(err);
        this.password = hash;
        next();
    });
});

UserSchema.method.comparePassword = (password) => {
    return bcrypt.compareSync(password, this.password);
};
module.exports = mongoose.model('User', UserSchema);