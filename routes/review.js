    const express = require("express");
    const router = express.Router({ mergeParams: true }); // to access :id from parent route
    const wrapAsync = require("../utils/wrapAsync.js");
    const ExpressError = require("../utils/ExpressError.js");
    const Review = require("../models/review.js");
    const Listing = require("../models/listing.js");
    const { validateReview, isLoggesdIn, isReviewAuthor } = require("../middleware.js");
    
    const reviewController =  require("../controllers/reviews.js")

    // POST review
    router.post("/",isLoggesdIn, validateReview, wrapAsync(reviewController.createReview));

    // DELETE review
    router.delete("/:reviewId",isLoggesdIn,isReviewAuthor, wrapAsync(reviewController.destroyReview));

    module.exports = router;
