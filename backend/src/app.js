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
  (username, password, done) => {
    console.log('Inside local strategy callback')
    console.log(username)
    axios.get(`http://localhost:8081/users`)
    .then(res => {
      console.log('axios worked')
      console.log(res.data.users[0])
      const user = res.data.users[0]
      if (!user) {
        console.log('no user')
        return done(null, false, { message: 'Invalid credentials.\n' });
      }
      if (password != user.password) {
        return done(null, false, { message: 'Invalid credentials.\n' });
      }
      console.log('successfully stored user')
      return done(null, user);
    })
    .catch(error => done(error));
    // app.get('/users?username=${username}', (req,res) => {
    //   res => {
    //     console.log(res.user)
    //   }
    // });
  }
))

const app = express();
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
app.use(express.json(), session({
  genid: (req) => {
    return uuid() // use UUIDs for session IDs
  },
  secret: 'This is a secret',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  },
  store: store,
  // Boilerplate options, see:
  // * https://www.npmjs.com/package/express-session#resave
  // * https://www.npmjs.com/package/express-session#saveuninitialized
  resave: false,
  saveUninitialized: true
}));
app.use(Passport.initialize());
app.use(Passport.session());

Passport.serializeUser((user, done) => {
  done(null, user._id);
});

Passport.deserializeUser((id, done) => {
  User.findById(id, function(err, user) {
    done(err, user);
}); 
});

mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }
);

const connection = mongoose.connection;

connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})

app.use(cors());

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
  // res.send('Hello ' + JSON.stringify(req.session));
  console.log(req.session)
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

app.get('/login', (req, res) => {
  console.log('Inside GET /login callback')
  console.log(req.sessionID)
  res.send('You got the login page!')
});

app.post('/login', (req, res, next) => {
  console.log('inside login post')
  Passport.authenticate('local', (err, user, info) => {
    console.log("The info is:" + info)
    console.log("User again:" + user)
    if(info) {return res.send(info.message)}
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    req.login(user, (err) => {
      console.log('Inside req.login() callback')
      console.log(user)
      if (err) { return next(err); }
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
    res.redirect('/')
  }
})

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});