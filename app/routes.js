module.exports = function (app, passport, db, ObjectId) {

  // normal routes ===============================================================
  app.get('/confirmation', function (req, res) {
    req.logout();
    res.render('confirmation.ejs');
  });
  // show the home page (will also have our login links)
  app.get('/', (req, res) => {

    db.collection('herbs').find().toArray((err, result) => {
      if (err) return console.log(err)
      const base = result.filter(h => h.component === "Base")
      const flavor = result.filter(h => h.component === "Flavor")
      const support = result.filter(h => h.component === "Support")
      const liked = result.filter(h => h.component === 0)
      res.render('index.ejs', {
        base: base, flavor: flavor, support: support, liked: liked
      })
    })
  })

  app.get('/cart', (req, res) => {
    db.collection('cart').find({userId:ObjectId(req.user._id)}).toArray((err, result) => {

      if (err) return console.log(err)
      res.render('cart.ejs', { cart: result })
    })
  })


  // PROFILE SECTION =========================
  app.get('/profile', isLoggedIn, function (req, res) {
    db.collection('messages').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('profile.ejs', {
        user: req.user,
        messages: result
      })
    })
  });

  // LOGOUT ==============================
  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

  // message board routes ===============================================================

  app.post('/cart', (req, res) => {
    //created a new document that went into messages collection
    //
    console.log(req.body)
    db.collection('cart').insertOne({
      _id: req.body.id,
      base: req.body.base,
      flavor: req.body.flavor,
      support: req.body.support,
      qty: 1,
      userId: req.user._id
    }, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/cart') /// create a get cart page
    })
  })

  app.put('/cart', (req, res) => {
    db.collection('cart')
      .findOneAndUpdate({
        _id: ObjectId(req.body.id),
      }, {
        $inc: {
          qty: req.body.qty
        }
      }, {
        sort: { _id: -1 },
        upsert: false
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
  })



  app.delete('/cart', (req, res) => {
    console.log(req.body.id, req.body.id === "616e19334e665fc02b002cbc", typeof req.body.id)
    db.collection('cart').findOneAndDelete({
      _id: ObjectId(req.body.id)
    }, (err, result) => {
      if (err) return res.send(500, err)
      res.send('Message deleted!')
    })
  })


  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', function (req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function (req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function (req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect('/profile');
    });
  });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}
