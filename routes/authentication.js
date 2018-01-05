const User = require('../models/user');
const jwt = require('jsonwebtoken');
const config = require('../config/database');

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

    router.get('/checkEmail/:email', (req, res) => {
        if (!req.params.email) {
            res.json({ success: false, message: "E-mail was not provided!" });
        } else {
            User.findOne({ email: req.params.email }, (err, user) => {
                if (err) {
                    res.json({ success: false, message: err });
                } else {
                    if (user) {
                        res.json({ success: false, message: "E-mail has already taken!" });
                    } else {
                        res.json({ success: true, message: "E-mail is available!" });
                    }
                }
            });
        }
    });

    router.get('/checkUsername/:username', (req, res) => {
        if (!req.params.username) {
            res.json({ success: false, message: "Username was not provided!" });
        } else {
            User.findOne({ username: req.params.username }, (err, user) => {
                if (err) {
                    res.json({ success: false, message: err });
                } else {
                    if (user) {
                        res.json({ success: false, message: "Username has already taken!" });
                    } else {
                        res.json({ success: true, message: "Username is available!" });
                    }
                }
            });
        }
    });

    router.post('/login', (req, res) => {
        if (!req.body.username) {
            res.json({ success: false, message: "No username was provided!" });
        }
        else {
            if (!req.body.password) {
                res.json({ success: false, message: "No Password was provided!" });
            } else {
                User.findOne({ username: req.body.username }, (err, user) => {
                    if (err) {
                        res.json({ success: false, message: err });
                    } else {
                        if (!user) {
                            res.json({ success: false, message: "Username not found!" });
                        } else {
                            const validPassword = user.comparePassword(req.body.password);
                            if (!validPassword) {
                                res.json({ success: false, message: "Password did not match" });
                            } else {
                                const token = jwt.sign({ userId: user._id }, config.secret, { expiresIn: '24h' });
                                res.json({ success: true, message: "Login successfull", token: token, user: { username: user.username } });
                            }
                        }
                    }
                })
            }
        }
    });

    router.use((req, res, next) => {
        const token = req.headers['authorization'];
        if (!token) {
            res.json({ success: false, message: 'No token found!' });
        } else {
            jwt.verify(token, config.secret, (err, decoded) => {
                if (err) {
                    res.json({ success: false, message: 'Token Invalid ' + err });
                } else {
                    req.decoded = decoded;
                    next();
                }
            });
        }
    });

    router.get('/profile', (req, res) => {
        User.findOne({ _id: req.decoded.userId }).select('username email').exec((err, user) => {
            if (err) {
                res.json({ success: false, message: err });
            } else {
                if (!user) {
                    res.json({ success: false, message: 'User not found!' });
                } else {
                    res.json({ success: true, user: user });
                }
            }
        });
    });

    router.get('/publicProfile/:username', (req, res) => {
        if (!req.params.username) {
            res.json({ success: false, message: 'username was not provided!' });
        } else {
            User.findOne({ username: req.params.username })
                .select('username email')
                .exec((err, user) => {
                    if (err) {
                        res.json({ success: false, message: "Something went wrong! " + err });
                    } else {
                        if (!user) {
                            res.json({ success: false, message: 'User not found!' });
                        } else {
                            res.json({ success: true, user: user });
                        }
                    }
                });
        }
    })
    return router;
}