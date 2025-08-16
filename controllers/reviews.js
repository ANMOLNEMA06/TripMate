
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

module.exports.createReview = async (req,res)=> {
  console.log(req.params.id);
  let listing = await Listing.findById(req.params.id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  console.log(newReview);
  listing.reviews.push(newReview._id);

  await newReview.save();
  await listing.save();
  req.flash("success", "New Review Created!!");
  res.redirect(`/listings/${listing._id}`);

}
module.exports.deleteReview =async (req, res) => {
  const { id, reviewId } = req.params;

  // Step 1: Remove the reviewId from the listing's reviews array
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

  // Step 2: Delete the actual review document
  await Review.findByIdAndDelete(reviewId);
req.flash("success", "Review Deleted!!");
  res.redirect(`/listings/${id}`);
}