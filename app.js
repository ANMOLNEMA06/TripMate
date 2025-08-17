if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const expressError = require("./utils/expressError.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const User = require("./models/user.js");

// ----------- MongoDB Atlas Connection -----------
const dbUrl = process.env.ATLASDB_URL;
if (!dbUrl) {
    console.error(" ATLASDB_URL not set in environment variables!");
    process.exit(1);
}

mongoose.connect(dbUrl)
    .then(() => console.log(" Connected to MongoDB Atlas"))
    .catch(err => console.log(" DB Connection Error:", err));

// ----------- EJS Setup -----------
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ----------- Middleware -----------
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ----------- Session Configuration -----------
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: { secret: process.env.SECRET || "thisshouldbeabettersecret" },
    touchAfter: 24 * 3600
});

store.on("error", (err) => console.log("SESSION STORE ERROR:", err));

const sessionOptions = {
    store,
    secret: process.env.SECRET || "thisshouldbeabettersecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
};

app.use(session(sessionOptions));
app.use(flash());

// ----------- Passport Setup -----------
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ----------- Flash & Current User Middleware -----------
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user || null;
    next();
});

// ----------- Routes -----------
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);



app.get("/", (req, res) => {
    res.redirect("/listings");   // direct listings page khulega
});

// ----------- 404 Handler -----------
// app.all("*", (req, res, next) => {
//     next(new expressError(404, "Page Not Found"));
// });

// ----------- Error Handler -----------
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

// ----------- Server Listen -----------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
