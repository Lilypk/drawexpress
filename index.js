const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const passportlocal = require('passport-local').Strategy;
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const { deserializeUser } = require('passport');
const app = express();
const User = require('./user');
const Feed = require('./feed');
const Canvas = require('./canvas');
mongoose.connect(
	'mongodb+srv://Lilypage:Dance123!@cluster0.cogqp.mongodb.net/draw?retryWrites=true&w=majority',
	{
		useNewUrlParser: true,
		useUnifiedTopology: true
	},
	() => {
		console.log('Mongoose is connected');
	}
);

// Need to set up CORS like this for auth to work
// app.use(
// 	cors({
// 		origin: 'http://localhost:3000',
// 		credentials: true
// 	})
// );
app.use(function (req, res, next) 
{	res.header("Access-Control-Allow-Methods", "POST,GET,PATCH,PUT,DELETE");	
res.header(		"Access-Control-Allow-Headers",		"Origin, X-Requested-With, Content-Type, Accept"	);	
res.header("Access-Control-Allow-Credentials", "true");	
res.header("Access-Control-Allow-Origin", "http://localhost:3000");	next();});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
	session({
		// We will use secret in our cookie-parser
		secret: 'this will be our secret code',
		resave: true,
		saveUninitialized: true
	})
);

// Pass in the actual value of secret
app.use(cookieParser('this will be our secret code'));
app.use(passport.initialize())
app.use(passport.session())
require('./passportConfig')(passport)


// Routes
app.get('/', function (req, res) {
	res.send('hello world')
  })


app.post('/login', (req, res, next) => {
  // use local strategy we defined
  passport.authenticate('local', (err, user, info) => {
    if (err) throw err
    if (!user) res.send('No User Exists')
    else {
      req.login(user, err => {
        if (err) throw err
        res.send('Successfully Authenticated')
        console.log(req.user)
      })
    }
  })(req, res, next)
});

app.post('/register', (req, res) => {
	console.log(req.body)
	User.findOne({ username: req.body.username }, async (err, doc) => {
		if (err) throw err;
		if (doc) res.send('User Already Exists');
		if (!doc) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
			const newUser = new User({
				username: req.body.username,
				password: hashedPassword
			});
			await newUser.save();
			passport.authenticate('local', { successRedirect: '/feed',
			failureRedirect: '/login' })

			// res.send('User Created');
		}
	});
});
app.get("/user/login", (req, res) =>{
    User.find({}).then(data => {
        res.json(data)
    })
})
app.get("/user/id", (req, res) =>{
    User.find(req.body).then((data) => {
        res.json(data)
    })
})
app.get("/feed", (req, res) =>{
    Feed.find({}).then(data => {
        res.json(data)
    })
})
app.post("/canvas", (req, res) =>{
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

// req.user stores the user
// req object will not be a user object containing session data
// accessible throughout whole app
app.get('/getUser', (req, res) => res.send(req.user));

app.set("port", process.env.PORT || 4000);

app.listen(app.get("port"), () => {
  console.log(`✅ PORT: ${app.get("port")} 🌟`);
});
