const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    minlength: 5
  },
  published: Number,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author'
  },
  genres: [String]
})

bookSchema.plugin(uniqueValidator)
module.exports = mongoose.model('Book', bookSchema)
