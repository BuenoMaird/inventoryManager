const express = require('express');
const uuid = require('uuid/v4')
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const bodyParser = require('body-parser');
const Passport  = require('passport');
const LocalStrategy = require('passport-local').Strategy
const axios = require('axios')
const cors = require('cors');

const User = require('../models/users');
const Weapon = require('../models/weapon');
const Equipment = require('../models/equipment');
const mongoose = require('mongoose');

require('dotenv').config();

Passport.use(new LocalStrategy(
  { usernameField: 'email' },
  (username, password, done) => {
    console.log('Inside local strategy callback')
    console.log(username)
    User.findOne({email: username}, function(err, user){
      console.log('Finding the user in local strategy = ' + user)
      if (!user) {
        console.log('no user')
        return done(null, false, { message: 'Invalid credentials.\n' });
      }
      if (password != user.password) {
        console.log('password wrong')
        return done(null, false, { message: 'Invalid credentials.\n' });
      }
      console.log('successfully stored user')
      return done(null, user);
    })
  }
))

const app = express();
app.set('trust proxy', 1)
const uri = process.env.ATLAS_URI;

const store = new MongoDBStore({
  uri: uri,
  collection: 'mySessions'
});
store.on('error',function(error){
  console.log(error)
});




const port = process.env.PORT || 8081
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(session({
  genid: (req) => {
    return uuid() // use UUIDs for session IDs
  },
  secret: 'This is a secret',
  cookie: {
    domain:'127.0.0.1:3000',
    path: "localhost:3000/login",
    httpOnly: true, 
    secure: false, 
    maxAge: 60000000
  },
  store: store,
  // Boilerplate options, see:
  // * https://www.npmjs.com/package/express-session#resave
  // * https://www.npmjs.com/package/express-session#saveuninitialized
  resave: false,
  saveUninitialized: false
}));
app.use(Passport.initialize());
app.use(Passport.session());

Passport.serializeUser((user, done) => {
  console.log('Inside serializeUser callback. User id is saved to the session file store here')
  done(null, user._id);
});

Passport.deserializeUser((id, done) => {
  console.log('Inside deserializeUser callback')
  console.log(`The user id passport saved in the session file store is: ${id}`)
  const user = User.findById(id, function (err, user) {});
  done(null, user);
});

mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }
);

const connection = mongoose.connection;

connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})
var allowedOrigins = ['http://localhost:3000', 'http://yourapp.com'];
app.use(cors({
  origin: function(origin, callback){
    console.log(`cors origin = ${origin}`)
    // allow requests with no origin 
    // (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.post('/equipment', (req, res) =>{
  const db = req.db;
  let itemType = req.body.itemType;
  let cost = req.body.cost;
  let weight = req.body.weight;
  
  //Weapon
  let damageType = req.body.damageType;
  let properties = req.body.properties;
  //Armor
  let style = req.body.style;
  let armorClass = req.body.armorClass;

  var new_equipment = new Equipment({
      cost: cost,
      weight: weight
  })
  switch(itemType){
    case "weapon":
      new_equipment.classification = [{itemType: itemType, damageType: damageType, style: style}]
    break;
    case "armor":
      new_equipment.classification = [{}]
  }
  
  new_equipment.save(function(error) {
    if (error) {
      console.log(error)
    }
    res.send({
      success: true,
      message: "Weapon saved successfully"
    })
  });
});
app.get('/equipment', (req, res) => {
  Equipment.find({}, 'itemType cost weight classification', function(error, equipment){
    if (error) {
      console.log(error)
    }
    res.send({
      equipment: equipment
    })
  }).sort({_id:-1})
})
app.get('/users', (req, res) => {
  console.log(`User authenticated? ${req.isAuthenticated()}`)
  // res.send('Hello ' + JSON.stringify(req.session));
  User.find({}, 'username email password', function(error, users){
    if(error){console.error(error); }
    res.send({
      users: users
    })
  }).sort({_id:-1})
})
app.post('/users', (req, res) => {
  var db = req.db;
  var username = req.body.username;
  var password = req.body.password;
  var email = req.body.email;
  var new_user = new User({
    username: username,
    password: password,
    email: email
  })
  new_user.save(function (error) {
    if (error) {
      console.log(error)
    }
    res.send({
      success: true,
      message: 'User saved successfully'
    })
  })
})
app.get('/user/:id', (req,res) => {
  console.log(req)
  var db = req.db;
  User.findById(req.params.id, 'username password email', function(error, user){
    if(error) {console.error(error);}
    res.send(user)
  });
});
app.put('/user/:id', (req, res) =>{
  var db = req.db;
  User.findById(req.params.id, 'username password email', function(error, user){
    if(error){console.error(error);}
    console.log(user)
    user.username = req.body.username
    user.password = req.body.password
    user.email = req.body.email
    user.save(function(error) {
      if(error){
        console.error(error);
      }
      res.send({
        success: true
      });
    });
  });
});
app.delete('/post/:id', (req, res) =>{
  var db = req.db
  Post.remove({
    _id: req.params.id
  }, function(err, post){
    if(err){
      res.send(err)
    }
    res.send({
      success: true
    })
  })
})
app.get('/sessionUser', (req, res) =>{
  let user = User.findOne({email: req.params.email}, function(err, user){
    if(err){console.error(err); }
    console.log(user)
    res.send({user: user})
  })
})
app.get('/login', (req, res) => {
  console.log('Inside GET /login callback')
  console.log(req.sessionID)
  res.send('You got the login page!')
});

// app.post('/login', (req, res) =>{
//   let user = User.find({email: req.body.email}, function(err, user){
//     res.send({token: req.sessionID})
//   })
  
// })

//App.post without NUXT
app.post('/login', (req, res, next) => {
  Passport.authenticate('local', (err, user, info) => {
    console.log("The info is:" + info)
    console.log("User again:" + user.email)
    if(info) {return res.send(info.message)}
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    req.login(user, (err) => {
      console.log('Inside req.login() callback')
      // console.log(req.headers)
      console.log(`is authenticated  ${req.isAuthenticated()}`)
      if (err) { return next(err); }
      console.log(`session ID =  ${req.sessionID}`)
      // res.cookie('connect.sid', `${req.sessionID}`)
      return res.redirect('/authrequired');
    })
    
  })(req, res, next);
})
app.get('/authrequired', (req, res) => {
  console.log('Inside GET /authrequired callback')
  console.log(`User authenticated? ${req.isAuthenticated()}`)
  if(req.isAuthenticated()) {
    res.send('you hit the authentication endpoint\n')
  } else {
    console.log('redirecting to home')
    // console.log(req)
    res.send(req.session)
    // res.redirect('http://localhost:3000/users')
  }
})

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});