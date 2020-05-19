const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const Passport  = require('passport');
const cors = require('cors');

var User = require('../models/users');
var Weapon = require('../models/weapon');
var Equipment = require('../models/equipment');
var mongoose = require('mongoose');
require('dotenv').config();
const app = express();
const uri = process.env.ATLAS_URI;
const store = new MongoDBStore({
  uri: uri,
  collection: 'mySessions'
})
store.on('error',function(error){
  console.log(error)
});

const port = process.env.PORT || 8081

app.use(express.json(), session({
  secret: 'This is a secret',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  },
  store: store,
  // Boilerplate options, see:
  // * https://www.npmjs.com/package/express-session#resave
  // * https://www.npmjs.com/package/express-session#saveuninitialized
  resave: true,
  saveUninitialized: true
}));


console.log(uri)
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
  User.find({}, 'username email', function(error, users){
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

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});