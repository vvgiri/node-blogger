let mongoose = require('mongoose')
require('songbird')

let commentSchema = mongoose.Schema({
	postId: {
		type: String,
		required: true
	},
	comment: {
		type: String,
		required: true
	},
	commentedUser: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		required: true
	}
})

module.exports = mongoose.model('comment', commentSchema)