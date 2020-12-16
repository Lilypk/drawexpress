const mongoose = require('mongoose');
let app = require('express')();
var cors = require('cors')
const bodyParser = require('body-parser');
let User = require("./user");
const jwt = require('jwt-simple')
let secret = "88d90dinlkjdk4";
let Feed = require('./feed');
let Canvas = require('./canvas');

app.use(cors());
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

function isAuthenticated(req, res, next) {
  if(req.headers.authorization){
      try{
          console.log("User has token");
          let token = req.headers.authorization.split("Bearer ")[1];
          console.log(token);
        let accessToken = jwt.decode(token, secret);
        return next();
      }catch(err){
          console.log(err);
          console.log("There is something wrong with your token");
          res.sendStatus(401)
      }
  }else{
      res.sendStatus(401)
  }
}

// Routes
app.get('/', function (req, res) {
	res.send('hello world')
  })

  app.post('/signup', (req, res) => {
    if (req.body.username && req.body.password) {
      let newUser = {
        username: req.body.username,
        password: req.body.password
      }
      console.log(newUser);
      User.findOne({ username: req.body.username })
        .then((user) => {
            console.log("29: ",user);
          if (!user) {
            console.log("creating new user")
            User.create(newUser)
              .then(user => {
                if (user) {
                  var payload = {
                    id: newUser.id,
                    userIsLoggedIn:true
                  }
                  var token = jwt.encode(payload, secret)
                  res.json({
                    token: token
                  })
                } else {
                  res.sendStatus(401)
                }
              })
          } else {
            res.sendStatus(401)
          }
        })
    } else {
      res.sendStatus(401)
    }
  })
  app.post('/login', (req, res) => {
    if (req.body.username && req.body.password) {
      User.findOne({ username: req.body.username}).then(user => {
        if (user) {
            console.log(user.id);
          if (user.password === req.body.password) {
            var payload = {
              id: user.id,
              userIsLoggedIn:true,
              access:"basic-user"
            }
            var token = jwt.encode(payload, secret)
            res.json({
              token: token,
              loggedIn:true,
              username:req.body.username
            })
          } else {
            res.sendStatus(401)
          }
        } else {
          res.sendStatus(401)
        }
      })
    } else {
      res.sendStatus(401)
    }
  })
app.get('/logout', (req, res) => {
    res.send({ hello: 'World' })
})
app.get('/private', isAuthenticated,
  (req, res) => {
    res.json({loggedIn:true})
  }
);
app.get('/user',
  //connectEnsureLogin.ensureLoggedIn(),
  (req, res) => res.send({user: req.user})
);



// app.get("/user/login", (req, res) =>{
//     User.find({}).then(data => {
//         res.json(data)
//     })
// })
// app.get("/user/id", (req, res) =>{
//     User.find(req.body).then((data) => {
//         res.json(data)
//     })
// })
app.get("/feed", (req, res) =>{
    Feed.find({}).then(data => {
        res.json(data)
    })
})
app.get('/canvas', (req, res) =>{
  Canvas.find({}).then(data => {
    res.json(data)
  })
})
app.post("/canvas", (req, res) =>{
  console.log('were creating', req.body)
    Canvas.create(req.body).then((data) => {
        res.json(data)
    })
})
app.put("/canvas/:id", (req, res) => {
    Canvas.findOneAndUpdate({ _id: req.params.id }, req.body)
    
    .then(data => {
        res.json(data)
}).catch(error => {
    res.json({error : 'could not update'})
})

})
app.delete("/canvas/:id", (req, res) => {
    Canvas.findOneAndDelete({ _id: req.params.id }, req.body)
    .then(data => {
        res.json(data)
    })
})
app.listen(4000,()=>{
  console.log('listening on 4000');
})
