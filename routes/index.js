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

router.get('/applications', isLoggedIn, function (req, res) {
  App.find().exec(function(err, apps) {
    if (err) {
      res.render('application.ejs', {
        error: 1
      });
    } else {
      res.render('application.ejs', {
        error: 0,
        apps: apps
      });
    }
  });
});

router.get('/applications/csv', isLoggedIn, function (req, res) {
  App.find().exec(function(err, apps) {
    if (err) {s
      // todo : show error to panel
      req.flash('fetchError', 'Cannot make csv.');
      res.redirect('/');
    } else {
      // hope there will be only small files
      res.writeHead(200, {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=export.csv'
      });

      apps.forEach(function(item) {
        res.write('"' + item.fullName.toString().replace(/\"/g, '""') + '",');
        res.write('"' + item.email.toString().replace(/\"/g, '""') + '",');
        res.write('"' + item.phone.toString().replace(/\"/g, '""') + '",');
        res.write('"' + item.link.toString().replace(/\"/g, '""') + '",');
        res.write('"' + (item.comment || '').toString().replace(/\"/g, '""') + '",');
        res.write('"' + item.createAt.toString().replace(/\"/g, '""') + '";');
        res.write('\r\n');
      });

      res.end();
    }
  });
});

router.post('/applications', function (req, res) {
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