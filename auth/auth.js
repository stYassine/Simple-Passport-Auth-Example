const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
/// We use this to extract the JWT sent by the user
const ExtractJWT = require('passport-jwt').ExtractJwt;

const User = require('../models/User');

/// OLD
// passport.use(new LocalStrategy({
//     username: '',
//     password: '',
// }, (email, password, done) => {

//     User.findOne({email})
//         .then(user => {
//             if(!user || !user.validatePassword(password)){
//                 return done(null, false, {errors: {'email or password': 'is invalid!' } })
//             }
//             return done(null, user);
//         })
//         .catch(done);

// }));
/// OLD



/// This verifies that the token sent by the user is valid
passport.use(new JWTstrategy({
    /// secret we used to sign our JWT
    secretOrKey : 'top_secret',
    /// we expect the user to send the token as a query parameter with the name 'secret_token'
    jwtFromRequest : ExtractJWT.fromUrlQueryParameter('secret_token')
}, async (token, done) => {
    try {
        //Pass the user details to the next middleware
        return done(null, token.user);
    } catch (error) {
        done(error);
    }
}));


/// Create a passport middleware to handle user registration
passport.use('register', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
}, async (email, password, done) => {
    try {
        //// CHECK IF EMAIL ALREADY EXISTS

        /// Save the information provided by the user to the the database
        const user = await User.create({email, password});
        /// Send the user information to the next middleware
        return done(null, user);
    } catch (error) {
        done(error);
    }
}));

/// Create a passport middleware to handle user Login
passport.use('login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
}, async (email, password, done) => {
    try {
        //Find the user associated with the email provided by the user
        const user = await User.findOne({ email });
        if(!user){
            /// If the user isn't found in the database, return a message
            return done(null, false, { message: 'User not found' });
        }
        /// Validate password and make sure it matches with the corresponding hash stored in the database
        /// If the passwords match, it returns a value of true.
        const validPassword = await user.isvalidPassword(password);
        
        if(!validPassword){
            return done(null, false, { message: 'Invalid Password' });
        }

        //Send the user information to the next middleware
        return done(null, user, { message: 'Logged In Sussessfully' });

    } catch (error) {
        done(error);
    }
}));
