const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const saltRounds = 10
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

userSchema.pre('save', function(next) {
    var user = this

    if (user.isModified('password')) {
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if (err) return next(err)
            
            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) return next(err)
                user.password = hash
                next()
            })
        })
    } else {
        next()
    }
    
})

userSchema.methods.comparePassword = function(plainPassword, callback) {
    // plainPassword 를 암호화해서 데이터베이스에 있는 암호화된 비밀번호랑 비교
    bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
        if (err) return callback(err),
            callback(null, isMatch)
    })
}

userSchema.methods.generateToken = function(callback) {
    
    var user = this
    //jsonwebtoken 를 이용해서 토큰 생성하기
    var token = jwt.sign(user._id.toHexString(), 'secretToken')
    user.token = token
    user.save(function(err, user) {
        if (err) return callback(err)
        callback(null, user)
    })
}


const User = mongoose.model('User', userSchema)

module.exports = { User }