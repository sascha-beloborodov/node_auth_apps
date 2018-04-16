var express = require('express');
var passport = require('passport');
var router = express.Router();
var App = require('../models/application');

router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Express'
  });
});

router.get('/login', function (req, res, next) {
  res.render('login.ejs', {
    message: req.flash('loginMessage')
  });
});

router.get('/signup', function (req, res) {
  res.render('signup.ejs', {
    message: req.flash('signupMessage')
  });
});

router.get('/profile', isLoggedIn, function (req, res) {
  res.render('profile.ejs', {
    user: req.user
  });
});

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/applications', function (req, res) {
  res.render('application.ejs', {
    user: req.user
  });
});

router.post('/applications', function (req, res) {
  console.log(req.body);
  try {
    var newApp = new App(req.body);
    newApp.save(function (err) {
      if (err) {
        res.status(422).json({
          'success': false,
          'error': err
        });
      } else {
        res.json({
          'success': true,
          'message': 'Заявка успешно добавлена'
        });
      }
    });
  } catch (e) {
    res.status(422).json({
      'success': false,
      'error': e
    });
  }
});

router.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/profile',
  failureRedirect: '/signup',
  failureFlash: true,
}));

router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true,
}));


module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/');
}