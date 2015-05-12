let bodyParser = require('body-parser')
let cookieParser = require('cookie-parser')
let session = require('express-session')
let passport = require('passport')
let express = require('express')
let morgan = require('morgan')
let flash = require('connect-flash')
let mongoose = require('mongoose')
let routes = require('./routes')
let passportMiddleware = require('./middleware/passport')
require('songbird')

const NODE_ENV = process.env.NODE_ENV
const PORT = process.env.PORT || 8000

let app = express()
app.passport = passport
if (NODE_ENV === 'development') {
	app.use(morgan('dev'))
}

// Use ejs for templating, with the default directory /views
app.set('view engine', 'ejs')

// Read cookies, required for sessions
app.use(cookieParser('ilovethenodejs'))
// Get POST/PUT body information (e.g., from html forms like login)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// In-memory session support, required by passport.session()
app.use(session({
  secret: 'ilovethenodejs',
  resave: true,
  saveUninitialized: true
}))

// Use the passport middleware to enable passport
app.use(passport.initialize())

// Enable passport persistent sessions
app.use(passport.session())

app.use(flash())

routes(app)
passportMiddleware(app)

mongoose.connect('mongodb://127.0.0.1:27017/blogger-schema')

app.listen(PORT, ()=> console.log(`Listening @ http://127.0.0.1:${PORT}`))