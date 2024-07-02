const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = mongoose.Schema({
    // userId: { type: mongoose.Types.ObjectId, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    fname: { type: String, required: false },
    lname: { type: String, required: false },
    role: { type: String, required: false, default: 'employee'},
    isAdmin: { type: Boolean, required: true, default: false}
})

userSchema.plugin(uniqueValidator)

module.exports = mongoose.model('User', userSchema)