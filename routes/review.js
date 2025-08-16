// const express = require("express");
// const router = express.Router({mergeParams: true});
// const wrapAsync = require("../utils/wrapAsync.js");
// const expressError = require("../utils/expressError.js");

// const Review = require("../models/review.js");
// const Listing = require("../models/listing");

// const {validateReview,isLoggedIn,isReviewAuthor} = require("../middleware.js");
// const reviewController = require("../controllers/reviews.js");








// router.post("/",isLoggedIn, validateReview, wrapAsync (reviewController.createReview));

// //Delete review route 
// router.delete("/:reviewId",
//   isLoggedIn, isReviewAuthor, wrapAsync(reviewController.deleteReview));


// module.exports = router;
const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
const reviewController = require("../controllers/reviews");

// Create a new review for a listing
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// Delete a specific review
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.deleteReview));

module.exports = router;
