const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
});

UserSchema.pre('save', async function(next){
    let user = this;
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
});
UserSchema.methods.isvalidPassword = async function(password){
    let user = this;
    const compare = await bcrypt.compare(password, user.password);
    return compare;
}


/// These 2 Are From Other Tutorial.
UserSchema.methods.generateJWT = function(){
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);

    return jwt.sign({
        email: this.email,
        id: this._id,
        exp: parseInt(expirationDate.getTime() / 1000, 10),
    }, 'secret');
}
UserSchema.methods.toAuthJSON = function(){
    return {
        _id: this._id,
        email: this.email,
        token: this.generateJWT(),
    }
}


const User = mongoose.model('User', UserSchema);

module.exports = User;