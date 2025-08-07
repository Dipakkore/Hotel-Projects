
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// console.log(process.env)

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Review = require("./models/review.js");
const wrapAsync = require("./utils/wrapAsync.js");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
// const mongoose = require('mongoose');



if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
// const dbUrl = process.env.ATLASDB_URL;


// const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("connected to db..");
  })
  .catch((err) => {
    console.log("connect error...................",err);
  });

async function main() {
  await mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
    tlsAllowInvalidCertificates: false,
  });
}


// mongoose.connect(process.env.ATLASDB_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   ssl: true,
//   tlsAllowInvalidCertificates: false,
// });



const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});


// store.on("error", () => {
//     console.log("ERROR IN MONGO SESSION STORE", err);
// })

const sessionOption = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
}



app.use(session(sessionOption));
app.use(flash());  

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware Flash
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error"); // Optional
    //  res.locals.currUser = req.user;
     res.locals.currUser = req.user;
    next();
});

// app.get("/demouser",async (req, res)=> {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "deepak"
//     })

//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// })

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const { parseArgs } = require("util");
const { url } = require("inspector");
const { connect } = require("http2");


// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust"


main()
    .then(() => {
        console.log("connected db");
    })
    .catch((err) => {
        console.log(err);
    })

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.use("/listings", listingsRouter);
// app.set("views", path.join(__dirname, "custom_folder"));




app.get("/coming", async(req, res) => {
    res.render("listings/coming.ejs");
})



app.use(flash());
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/",  userRouter);

//index route
app.get("/listings", async(req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
});


// New route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs")
})


//Show route
app.get("/listings/:id", async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
});

//Create Route
app.post("/listings", wrapAsync(async(req, res) => {
    // const newListing = new Listing(req.body.listing);
    let result = listingSchema.validate(req.body);
    console.log(result);
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));


//Edit Route
app.get("/listings/:id/edit", async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });

})

// Update Route (PUT)
app.put("/listings/:id", async(req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, req.body.listing, { runValidators: true, new: true });
    res.redirect(`/listings/${id}`);
});


//Delete Route
app.delete("/listings/:id", async(req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
});

// Catch-all 404 route
// app.all("*", (req, res, next) => {
//     next(new ExpressError(404, "Page Not Found"));
// });

// Custom error handler middleware
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh no, something went wrong!";
    res.status(statusCode).render("listings/error.ejs", { err });
});


// Delete Review Route
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res)=>{
    let { id, reviewId} =  req.params;
    
    await Listing.findByIdAndUpdate(id, {$pull: {review: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}))

app.listen(8080, () => {
    console.log("server listing to port 8080");
})

