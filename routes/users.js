const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

const keys = require('../config/keys');
const User = require('../models/user');

router.post('/register', (req, res, next) => {
    console.log("req.body is:", req.body);
    let newUser = new User({
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
    });

    User.addUser(newUser, (err, user) => {
        if (err) {
             res.json({success: false, msg: 'Failed to register user'});
        }
        else {
            res.json({success: true, msg: 'User registered'});
        }
    })

});

router.post('/authenticate', (req, res, next) => {
    console.log(req.body);
    const username = req.body.username;
    const password = req.body.password;

    User.getUserByUsername(username, (err, user) => {
        if (err) throw err;
        if (!user) {    // no user found
            return res.json({success: false, msg: 'User not found'});
        }
        // the user was found
        User.comparePassword(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {  // password matches
                const token = jwt.sign(user.toJSON(), keys.secret, {
                    expiresIn: 604800   // expires in 1 week
                });
                res.json({success: true, 
                    token: 'JWT ' + token, 
                    user: { // creating our own user as a response to not send the password
                        id: user._id, 
                        name: user.name, 
                        username: user.username, 
                        email: user.email
                    }
                });
            }
            else {  // password does not match
                return res.json({success: false, msg: 'Wrong password'});
            }
        });
    });
});

router.get('/profile', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    res.json({user: req.user});
});

module.exports = router;