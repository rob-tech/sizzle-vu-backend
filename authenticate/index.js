const passport = require("passport")
const User = require("../schemas/user")
const JwtStrategy = require("passport-jwt").Strategy
const ExtractJwt = require("passport-jwt").ExtractJwt
const jwt = require("jsonwebtoken")
const LocalStrategy = require("passport-local").Strategy

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
passport.use(new LocalStrategy(User.authenticate()))//enable username/password verification

var options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: "65198198151654719165121613165161"
} 

module.exports = {
    getToken: (user) => {
        return jwt.sign(user, options.secretOrKey, { expiresIn: 3600 })
    },

    verifyUser: passport.authenticate("jwt", {session: false}),
    // local: passport.use(new LocalStrategy(User.authenticate())),
    jwtPassport: 
        passport.use(new JwtStrategy(options, (jwt_payload, done) => {
        User.findById(jwt_payload._id, (err, user) => {
            if (err)
                return done(err, false)
            else if (user)
                return done(null, user)
            else 
               return(null, false)
        })
    })),
  
    adminOnly: (req, res, next) => {
        if(req.user.role === "admin")
        next()
        else {
            res.status= 401
        }
    }
}