let mongoose = require('mongoose')
let DataUri = require('datauri')
require('songbird')

let postSchema = mongoose.Schema({
	userid: {
		type: String,
		required: true
	},
	title: {
		type: String,
		required: true
	},
	content: {
		type: String,
		required: true
	},
	image: {
		data: Buffer,
		contentType: String
	},
	createdDate: {
		type: Date,
		required: true
	},
	updatedDate: {
		type: Date,
		required: true
	}
})

postSchema.virtual('imageDataUri').get(function () {
	if (!this.image) return null
	let datauri = new DataUri()
	let imageDataUri = datauri.format('.' + this.image.contentType.split('/').pop(), this.image.data)
	return `data:${this.image.contentType};base64,${imageDataUri.base64}`
})

postSchema.virtual('lastUpdated').get(function () {
	if (!this.createdDate) return null
	return this.updatedDate > this.createdDate ? this.updatedDate : this.createdDate
})

module.exports = mongoose.model('posts', postSchema)