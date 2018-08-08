module.exports = function(app, passport, db) {

  // render INDEX ===========================================
  app.get('/', function(req, res) {
    res.render('index.ejs');
  });

  //render LOGIN ============================================
  app.get('/login', function(req, res) {
    res.render('login.ejs');
  });

  //proceess login
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
  }));

  //process logout ===========================================
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  //render signup ============================================
  app.get('/signup', function(req, res) {
    res.render('signup.ejs');
  });

  //proceess signup
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/login',
    failureRedirect: '/signup',
    failureFlash: true
  }));

  //render DASHBOARD ==========================================
  app.get('/dashboard', isLoggedIn, function(req, res) {
    console.log(req.user);
    var user = req.user;
    var role = req.user.role;
    db.collection('journalEntries').find().toArray((err, result) => {
      if (err) return console.log(err);
      console.log(result)
      res.render('dashboard.ejs', {
        user: req.user,
        entries: result
      });
    });
  });

  app.get('/dashboard/refresh', isLoggedIn, function (req, res) {
    var user = req.user;
    var role = req.user.role;
    db.collection('users').find().toArray((err, result) => {
      res.json(result);
      if (err) return console.log(err);
      console.log(result)
    })
  });

  //render client journal entries TO DASHBOARD ================================

  //post client journal entries ===============================================
  app.post('/journalEntries', (req, res) => {
      var user      = req.user;
      var entryDate = Date.now()
      db.collection('journalEntries').save({
        journal   : req.body.journal,
        firstName : req.user.firstName,
        lastName  : req.user.lastName,
        entryDate : entryDate
      },(err, result) => {
        if (err) return console.log(err)
         console.log('saved to database')
         res.redirect('/dashboard')
      })
    })

  //unlink accounts ===========================================
  app.get('/unlink/local', isLoggedIn, function(req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function(err) {
      res.redirect('/dashboard');
    });
  });

  // route middleware to ensure user is logged in
  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
      return next();
    res.redirect('/');
  }
};
