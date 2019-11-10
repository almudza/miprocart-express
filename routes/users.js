var express = require('express');
var router = express.Router();
var passport = require('passport');
var bcrypt = require('bcryptjs');

/**
 * ===============================================================
 * =================== Get Users Model ===========================
 * ===============================================================
 */
var User = require('../models/user');



/**
 * ===============================================================
 * =================== Get Register ==============================
 * ===============================================================
 */
router.get('/register', function(req, res) {

    var name = "";
    var email = "";
    var username = "";

    res.render('register', {
        title: 'Register',
        name: name,
        email: email,
        username: username
    });
});

/**
 * ===============================================================
 * =================== Post Register ==============================
 * ===============================================================
 */
router.post('/register', function(req, res) {

    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2',' Password do not match!').equals(password);

    var errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors,
            user: null,
            title: 'Register',
            name: name,
            email: email,
            username: username
        });
    } else {
        User.findOne({username: username}, function(err, user) {
            if (err)
                console.log(err);

            if (user) {
                req.flash('danger', 'Username exists, choose another !');
                res.redirect('/users/register');
            } else {
                var user = new User({
                    name: name,
                    email: email,
                    username: username,
                    password: password,
                    admin: 0 // if registre admin change to 1 and back to 0 to normal user register
                });

                bcrypt.genSalt(10, function(err, salt) {
                    bcrypt.hash(user.password, salt, function(err, hash) {
                        if (err)
                            console.log(err);

                        user.password = hash;

                        user.save(function (err) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.flash('success', 'You are now registered!');
                                res.redirect('/users/login')
                            }
                        });
                    });
                });
            }
        });
    }

});

/**
 * ===============================================================
 * =================== Get Login Form ==============================
 * ===============================================================
 */
router.get('/login', function(req, res) {

    if(res.locals.user) res.redirect('/');

    res.render('login', {
        title: 'Login'
    });
});

/**
 * ===============================================================
 * ======================= POST Login ==============================
 * ===============================================================
 */

 router.post('/login', function(req, res, next) {

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
 });

/**
 * ===============================================================
 * ======================= Get Logout ==============================
 * ===============================================================
 */

 router.get('/logout', function(req, res) {

    req.logout();
    
    req.flash('success', 'You\'re logged out');
    res.redirect('/users/login');

 });

module.exports = router;