const User = require('../models/user');
const Blog = require('../models/blog');
const jwt = require('jsonwebtoken');
const config = require('../config/database');

module.exports = (router) => {

    router.post('/newBlog', (req, res) => {
        if (!req.body.title) {
            res.json({ success: false, message: "Blog title is required" });
        }
        else if (!req.body.body) {
            res.json({ success: false, message: "Blog body is required" });
        }
        else if (!req.body.createdBy) {
            res.json({ success: false, message: "Blog CreatedBy is required" });
        }
        else {
            const blog = new Blog({
                title: req.body.title,
                body: req.body.body,
                createdBy: req.body.createdBy
            });
            blog.save((err) => {
                if (err) {
                    if (err.errors) {
                        if (err.errors.title) {
                            res.json({ success: false, message: err.errors.title.message });
                        } else if (err.errors.body) {
                            res.json({ success: false, message: err.errors.body.message });
                        } else {
                            res.json({ success: false, message: err.errmsg });
                        }
                    } else {
                        res.json({ success: false, message: err });
                    }
                } else {
                    res.json({ success: true, message: "Blog Created Successfully!" });
                }
            });
        }
    });

    router.get('/allBlogs', (req, res) => {
        Blog.find({}, (err, blogs) => {
            if (err) {
                res.json({ success: false, message: err });
            } else {
                if (!blogs) {
                    res.json({ success: false, message: "No Blog found!" });
                } else {
                    res.json({ success: true, blogs: blogs });
                }
            }
        }).sort({ '_id': -1 });
    });

    router.get('/singleBlog/:id', (req, res) => {
        if (!req.params.id) {
            res.json({ success: false, message: "Blog Id was not found!" });
        } else {
            Blog.findOne({ _id: req.params.id }, (err, blog) => {
                if (err) {
                    res.json({ success: false, message: "Not a valid ID for Blog" });
                } else {
                    if (!blog) {
                        res.json({ success: false, message: "Blog not found!" });
                    } else {
                        User.findOne({ _id: req.decoded.userId }, (err, user) => {
                            if (err) {
                                res.json({ success: false, message: err });
                            } else {
                                if (!user) {
                                    res.json({ success: false, message: "Unable to authenticate user!" });
                                } else {
                                    if (user.username !== blog.createdBy) {
                                        res.json({ success: false, message: "You are not authorized to edit this blog" });
                                    } else {
                                        res.json({ success: true, blog: blog });
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }
    });

    router.put('/updateBlog', (req, res) => {
        if (!req.body._id) {
            res.json({ success: false, message: "No Blog id Provided!" });
        } else {
            Blog.findOne({ _id: req.body._id }, (err, blog) => {
                if (err) {
                    res.json({ success: false, message: "Blog Id is not Valid!" });
                } else {
                    if (!blog) {
                        res.json({ success: false, message: "Blog Id was not found!" });
                    } else {
                        User.findOne({ _id: req.decoded.userId }, (err, user) => {
                            if (err) {
                                res.json({ success: false, message: err });
                            } else {
                                if (!user) {
                                    res.json({ success: false, message: "Unable to authenticate user!" });
                                } else {
                                    if (user.username !== blog.createdBy) {
                                        res.json({ success: false, message: "You are not authorized to edit this blog" });
                                    } else {
                                        blog.title = req.body.title;
                                        blog.body = req.body.body;
                                        blog.save((err) => {
                                            if (err) {
                                                res.json({ success: false, message: err });
                                            } else {
                                                res.json({ success: true, message: "Blog updated successfully!" });
                                            }
                                        })
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }
    });

    router.delete('/deleteBlog/:id', (req, res) => {
        if (!req.params.id) {
            res.json({ success: false, message: "Blog Id was not provided!" });
        } else {
            Blog.findOne({ _id: req.params.id }, (err, blog) => {
                if (err) {
                    res.json({ success: false, message: err });
                } else {
                    if (!blog) {
                        res.json({ success: false, message: "Blog with this id not found" });
                    } else {
                        User.findOne({ _id: req.decoded.userId }, (err, user) => {
                            if (err) {
                                res.json({ success: false, message: err });
                            } else {
                                if (!user) {
                                    res.json({ success: false, message: "Unable to authorized user" });
                                } else {
                                    if (user.username !== blog.createdBy) {
                                        res.json({ success: false, message: "You are not authorized to delte this blog" });
                                    } else {
                                        blog.remove((err) => {
                                            if (err) {
                                                res.json({ success: false, message: err });
                                            } else {
                                                res.json({ success: true, message: "Blog Deleted successfully" });
                                            }
                                        });
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }
    });

    router.put('/likeBlog', (req, res) => {
        if (!req.body.id) {
            res.json({ success: false, message: "Blog Id was not provided!" });
        } else {
            Blog.findOne({ _id: req.body.id }, (err, blog) => {
                if (err) {
                    res.json({ success: false, message: err });
                } else {
                    if (!blog) {
                        res.json({ success: false, message: "That blog was not found" });
                    } else {
                        User.findOne({ _id: req.decoded.userId }, (err, user) => {
                            if (err) {
                                res.json({ success: false, message: "Something went wrong!" });
                            } else {
                                if (!user) {
                                    res.json({ success: false, message: "Could no authenticate the user" });
                                } else {
                                    if (user.username === blog.createdBy) {
                                        res.json({ success: false, message: "You can not like your own post" });
                                    } else {
                                        if (blog.likedBy.includes(user.username)) {
                                            res.json({ success: false, message: "You already liked this post" });
                                        } else {
                                            if (blog.dislikedBy.includes(user.username)) {
                                                blog.dislikes--;
                                                const arrayIndex = blog.dislikedBy.indexOf(user.username);
                                                blog.dislikedBy.splice(arrayIndex, 1);
                                                blog.likes++;
                                                blog.likedBy.push(user.username);
                                                blog.save((err) => {
                                                    if (err) {
                                                        res.json({ success: false, message: "Something went wrong" });
                                                    } else {
                                                        res.json({ success: true, message: "You liked blog!" });
                                                    }
                                                });
                                            } else {
                                                blog.likes++;
                                                blog.likedBy.push(user.username);
                                                blog.save((err) => {
                                                    if (err) {
                                                        res.json({ success: false, message: "Something went wrong" });
                                                    } else {
                                                        res.json({ success: true, message: "You liked blog!" });
                                                    }
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }
    });

    router.put('/dislikeBlog', (req, res) => {
        if (!req.body.id) {
            res.json({ success: false, message: "Blog Id was not provided!" });
        } else {
            Blog.findOne({ _id: req.body.id }, (err, blog) => {
                if (err) {
                    res.json({ success: false, message: err });
                } else {
                    if (!blog) {
                        res.json({ success: false, message: "That blog was not found" });
                    } else {
                        User.findOne({ _id: req.decoded.userId }, (err, user) => {
                            if (err) {
                                res.json({ success: false, message: "Something went wrong!" });
                            } else {
                                if (!user) {
                                    res.json({ success: false, message: "Could no authenticate the user" });
                                } else {
                                    if (user.username === blog.createdBy) {
                                        res.json({ success: false, message: "You can not like your own post" });
                                    } else {
                                        if (blog.dislikedBy.includes(user.username)) {
                                            res.json({ success: false, message: "You already disliked this post" });
                                        } else {
                                            if (blog.likedBy.includes(user.username)) {
                                                blog.likes--;
                                                const arrayIndex = blog.likedBy.indexOf(user.username);
                                                blog.likedBy.splice(arrayIndex, 1);
                                                blog.dislikes++;
                                                blog.dislikedBy.push(user.username);
                                                blog.save((err) => {
                                                    if (err) {
                                                        res.json({ success: false, message: "Something went wrong" });
                                                    } else {
                                                        res.json({ success: true, message: "You disliked blog!" });
                                                    }
                                                });
                                            } else {
                                                blog.dislikes++;
                                                blog.dislikedBy.push(user.username);
                                                blog.save((err) => {
                                                    if (err) {
                                                        res.json({ success: false, message: "Something went wrong" });
                                                    } else {
                                                        res.json({ success: true, message: "You disliked blog!" });
                                                    }
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }
    });

    router.post('/comment', (req, res) => {
        if (!req.body.comment) {
            res.json({ success: false, message: "Comment was not provided!" });
        }
        else if (!req.body.id) {
            res.json({ success: false, message: "No id was provided!" });
        } else {
            Blog.findOne({ _id: req.body.id }, (err, blog) => {
                if (err) {
                    res.json({ success: false, message: "Something went wrong" });
                }
                else if (!blog) {
                    res.json({ success: false, message: "Blog not found!" });
                } else {
                    User.findOne({ _id: req.decoded.userId }, (err, user) => {
                        if (err) {
                            res.json({ success: false, message: "Something went wrong" });
                        } else if (!user) {
                            res.json({ success: false, message: "User not found!" });
                        } else {
                            blog.comments.push({
                                comment: req.body.comment,
                                commentator: user.username
                            });
                            blog.save((err) => {
                                if (err) {
                                    res.json({ success: false, message: "Something went wrong to save comments" });
                                } else {
                                    res.json({ success: true, message: "Comment saved." });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
    return router;
}