let mongoose = require('mongoose')
let bcrypt = require('bcryptjs')
let nodeify = require('bluebird-nodeify')

require('songbird')

let userSchema = mongoose.Schema({
	username: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	blogTitle: String,
	blogDescription: String
})

userSchema.methods.generateHash = async function (password) {
	return await bcrypt.promise.hash(password, 8)
}

userSchema.methods.validatePassword = async function (password) {
	return await bcrypt.promise.compare(password, this.password)
}

userSchema.pre('save', function(callback) {
	nodeify(async() => {
		if(!this.isModified('password')) return callback()
		this.password = await this.generateHash(this.password)
	}(), callback)
})

userSchema.path('password').validate(function(pw) {
	return pw.length >= 4 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw)
})

module.exports = mongoose.model('user', userSchema)