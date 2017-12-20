const User = require('../models/user');

module.exports = (router) => {

    router.post('/register', (req, res) => {
        if (!req.body.email) {
            res.json({ success: false, message: "You must provide an email!" });
        } else {
            if (!req.body.username) {
                res.json({ success: false, message: "You must provide an username!" });
            } else {
                if (!req.body.password) {
                    res.json({ success: false, message: "You must provide a password!" });
                } else {
                    let user = new User({
                        email: req.body.email,
                        username: req.body.username,
                        password: req.body.password
                    });

                    user.save((err) => {
                        if (err) {
                            if (err.code === 11000) {
                                res.json({ success: false, message: "username or email already exits" });
                            } else {
                                if (err.errors) {
                                    if (err.errors.email) {
                                        res.json({ success: false, message: err.errors.email.message });
                                    } else {
                                        if (err.errors.username) {
                                            res.json({ success: false, message: err.errors.username.message });
                                        } else {
                                            if (err.errors.password) {
                                                res.json({ success: false, message: err.errors.password.message });
                                            } else {
                                                res.json({ success: false, message: err });
                                            }
                                        }
                                    }
                                } else {
                                    res.json({ success: false, message: "User not created.Error", err });
                                }
                            }
                        } else {
                            res.json({ success: true, message: "Account Created successfully" });
                        }
                    });
                }
            }
        }
    });
    return router;
}