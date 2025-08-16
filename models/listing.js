const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review"); // ✅ Use correct path if needed


const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image:{
url:String,
filename:String,
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    }
  ],
  owner: {
    type:Schema.Types.ObjectId,
    ref: "User",
  },
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if(listing) {
    await Review.deleteMany({ _id: {$in: listing.reviews}});
  }
})







// Pre-save middleware to handle empty image
listingSchema.pre("save", function (next) {
  if (!this.image || !this.image.url) {
    this.image = {
      filename: "default_image",
      url:
        "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    };
  }
  next();
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
