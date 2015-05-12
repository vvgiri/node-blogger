let isLoggedIn = require('./middleware/isLoggedIn')
let then = require('express-then')
let multiparty = require('multiparty')
let Post = require('./post')
let User = require('./user')
let Comment = require('./comment')
let fs = require('fs')
module.exports = (app) => {
let passport = app.passport

app.get('/', (req, res) => res.render('index.ejs'))

app.get('/login', (req, res) => res.render('login.ejs', {message: req.flash('error')}))

app.get('/signup', (req, res) => res.render('signup.ejs', {message: req.flash('error')}))

app.get('/profile', isLoggedIn, then(async(req, res) => {
  let posts = await Post.promise.find({userid: req.user.id})
  res.render('profile.ejs', {
    user: req.user,
    posts: posts,
    message: req.flash('error')
  })
}))
// process the login form
app.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
}))

app.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
}))

app.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

app.get('/post/:postid?', isLoggedIn, then(async(req, res) => {
  let postid = req.params.postid
  let post
  let verb
  if(!postid){
    verb = 'Create'
    post = {}
  } else {
    verb = 'Update'
    post = await Post.promise.findById(postid)
    if(!post) {
      res.send('404', 'Not Found')
      return
    }
  }
  res.render('post.ejs', {
    post: post,
    verb: verb
  })
}))

app.post('/post/:postid?', isLoggedIn, then(async(req, res) => {
  let postid = req.params.postid
  let[{title: [title], content: [content]}, {image: [file]}] = await new multiparty.Form().promise.parse(req)
  let post
  if(!postid){
    post = new Post()
    post.userid = req.user.id
    post.createdDate = new Date()
    post.updatedDate = post.createdDate
  } else {
    post = await Post.promise.findById(postid)
    post.updatedDate = new Date()
    if(!post) {
      res.send('404', 'Not Found')
      return
    }
  }
  post.title = title
  post.content = content
  if(file.originalFilename && file.originalFilename !== '') {
    post.image.data = await fs.promise.readFile(file.path)
    post.image.contentType = file.headers['content-type']
  }
  await post.save()
  res.redirect('/blog/' + encodeURI(req.user.blogTitle))
}))

app.get('/post/delete/:postid', isLoggedIn, then(async(req, res) => {
  let postId = req.params.postid
  await Post.promise.findByIdAndRemove(postId)
  res.redirect('/profile')
}))

app.get('/post/view/:postid', then(async(req, res) => {
  let postId = req.params.postid
  let post = await Post.promise.findById(postId)
  if(!post) {
    res.send('404', 'Not Found')
    return
  }
  let comments = await Comment.promise.find({postId: postId})
  let lastUpdated = post.updatedDate > post.createdDate ? post.updatedDate : post.createdDate
  res.render('viewpost.ejs', {
    post: post,
    comments: comments,
    isAuthenticated: req.isAuthenticated()
  })
}))

app.get('/blog/:blogTitle', then(async(req, res) => {
  let blogTitle = decodeURI(req.params.blogTitle).toString()
  let user = await User.promise.findOne({blogTitle: blogTitle})
  let posts = await Post.promise.find({userid: user.id})
  res.render('blogs.ejs', {
    posts: posts,
    user: user
  })
}))

app.post('/post/:postid/comment', isLoggedIn, then(async(req, res) => {
  let postId = req.params.postid
  let comment = new Comment()
  comment.postId = postId
  comment.comment = req.body.comment
  comment.commentedUser = req.user.username
  comment.date = new Date()
  await comment.save()
  res.redirect('/post/view/' + postId)
}))
}