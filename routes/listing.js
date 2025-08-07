const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
// const Listing = require("../models/listing.js");
// const Review = require("../models/review.js");
const Listing = require("../models/listing.js"); // ✅ This line is required!
const {isLoggesdIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer')
const {storage} = require("../cloudConfig.js")
// const upload = multer({ dest: 'uploads/' })
const upload = multer({ storage })


router
.route("/")
.get(wrapAsync(listingController.index))
.post(
     isLoggesdIn,
     upload.single('listing[image]'),
     validateListing,
      wrapAsync(listingController.createListing)
 );



// New route
router.get("/new", isLoggesdIn, listingController.renderNewForm);

router
.route("/:id")
.get( 
    wrapAsync(listingController.showListing)
)
.put(
     isLoggesdIn,
     isOwner,
     upload.single('listing[image]'),
     validateListing, 
     wrapAsync(listingController.uppdateListing)
    )
.delete(
    isLoggesdIn,
    isOwner, 
    wrapAsync(listingController.destroyListing)
);



// Edit Route
router.get("/:id/edit", isLoggesdIn,wrapAsync(listingController.renderEditForm));


module.exports = router;