let nodeifyit = require('nodeifyit')
require('songbird')
let LocalStrategy = require('passport-local').Strategy
let User = require('../user')

module.exports = (app) => {
let passport = app.passport
passport.use(new LocalStrategy({
    usernameField: 'email',
    failureFlash: true
}, nodeifyit(async (email, password) => {
    let regExQuery
    let regExp = new RegExp(email, "i")
    if(email.indexOf('@')) {
        regExQuery = {email: {$regex: regExp}}
    } else {
        regExQuery = {username: {$regex: regExp}}
    }
    let user = await User.promise.findOne(regExQuery)
    if(!user) {
        return [false, {message: 'Invalid username or password'}]
    }
    if(!await user.validatePassword(password)) {
        return [false, {message: 'Invalid password'}]
    }
    return user
}, {spread: true})))

passport.use('local-signup', new LocalStrategy({
  usernameField: 'email',
    passReqToCallback: true
}, nodeifyit(async (req, email, password) => {
    let {username, blogTitle, blogDescription} = req.body
    let emailRegExp = new RegExp(email, "i")
    let emailRegExQuery = {email: {$regex: emailRegExp}}
    let usernameRegExp = new RegExp(username, "i")
    let usernameRegExQuery = {username: {$regex: usernameRegExp}}
    if(!email.indexOf('@')){
        return [false, {message: 'The email is invalid'}]
    }
  if(await User.promise.findOne(emailRegExQuery)){
    return [false, {message: 'The email is already taken'}]
  }
    if(await User.promise.findOne(usernameRegExQuery)){
        return [false, {message: 'The username is already taken'}]
    }
  let user = new User()
  user.username = username
    user.email = email
  user.password = password
    user.blogTitle = blogTitle
    user.blogDescription = blogDescription
    try {
        return await user.save()
    } catch (e) {
        console.log('Validation error', e)
        return [false, {message: e.message}]
    }
}, {spread: true})))

passport.serializeUser(nodeifyit(async (user) => user._id))
passport.deserializeUser(nodeifyit(async (id) => {
    return await User.promise.findById(id)
}))

}