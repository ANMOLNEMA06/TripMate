if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}



const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const expressError = require("./utils/expressError.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
// const MONGO_URL = "mongodb://localhost:27017/wanderlust";
const session = require("express-session");
const MongoStore = require('connect-mongo');

const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const dbUrl = process.env.ATLASDB_URL;





// Mongoose DB Connection
main().then(() => {
    console.log("Connected to DB");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(dbUrl);
}

// Set EJS Engine
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
crypto:{
    secret:process.env.SECRET,

},
touchAfter:24*3600,
});
store.on("error",(err) =>{
    console.log("ERROR in MONGO SESSION STORE",err);
});

const sessionOptions={
    store,
    secret: process.env.SECRET, 
    resave: false, 
    saveUninitialized: true,
    cookie:{
    expires:  Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    },



};






// Root Route

// app.get("/", (req, res) => {
//     res.send("hi I am root");
// });




app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());








// Make currUser and flash messages available in all views
app.use((req, res, next) => {
    
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});












const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);

    if (error) {
        const errMsg = error.details.map((el) => el.message).join(", ");
        throw new expressError(400, errMsg); // send to error handler
    } else {
        next(); // all good, continue
    }
};

// app.get("/demouser", async (req,res) => {
//     let fakeUser = new User ({
//         email: "student@gmail.com",
//         username: "deltta-student",

//     });
//     let registeredUser = await User.register
//     (fakeUser,"helloworld");
//     res.send(registeredUser);

// });






app.use("/listings", listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);
// // 404 Not Found Route
// app.all("*", (req, res) => {
//     res.status(404).send("404 Page Not Found Bro ");
// });

// ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
   
   res.status(statusCode).render("error.ejs",{ message } );
    // console.error("🔥 ERROR:", err);
//    res.status(statusCode).send(message);
});

// SERVER LISTEN
app.listen(8080, () => {
    console.log("server is running on port 8080");
});
