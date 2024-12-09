import mongoose from "mongoose";

// Define the review schema
const reviewSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: [true, "Comment is required"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 10,
    },
    sentiment: { type: Number, required: false },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: [true, "User ID is required"],
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // Reference to the Product model
        required: [true, "Product ID is required"],
      },
  },
  { timestamps: true }
);

// Create the Review model
const Review = mongoose.model("Review", reviewSchema);

export default Review;

