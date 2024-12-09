// controllers/review.controller.js
import Review from "../models/review.model.js"
import axios from "axios";

export const createReview = async (req, res) => {
  const { comment, rating } = req.body;
  const productId = req.params.id;

  try {
    // Gọi API AI để lấy sentiment
    const aiResponse = await axios.post("http://127.0.0.1:5000/predict", { comment, rating });
    const sentiment = aiResponse.data.prediction;  // Nhận kết quả sentiment từ AI

    // Tạo review mới với sentiment
    const newReview = new Review({
      comment,
      rating,
      sentiment,  // Gán sentiment vào review
      userId: req.user._id,
      productId,
    });

    await newReview.save();  // Lưu vào database
    res.status(201).json({ review: newReview });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ error: "Error submitting review" });
  }
};


export const analyzeReviews = async (req, res) => {
  try {
    // Lấy tất cả các đánh giá từ database
    const reviews = await Review.find({}); // Điều chỉnh query nếu cần lọc dữ liệu
    
    if (reviews.length === 0) {
      return res.status(404).json({ message: "Không có đánh giá nào." });
    }

    // Gửi từng đánh giá đến AI endpoint để phân tích sentiment
    const results = await Promise.all(reviews.map(async (review) => {
      const { comment, rating } = review;

      // Gọi AI endpoint
      const response = await axios.post("http://127.0.0.1:5000/predict", { comment, rating });
      return {
        comment,
        rating,
        sentiment: response.data.prediction,  // Kết quả từ AI
      };
    }));

    // Trả kết quả về frontend
    res.status(200).json(results);

  } catch (error) {
    console.error("Lỗi khi gọi AI endpoint:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// Lấy review dựa trên sentiment
export const getReviewsBySentiment = async (req, res) => {
  const { type } = req.params; // 'positive', 'neutral', 'negative'

  // Map sentiment type thành giá trị số
  const sentimentMap = {
    positive: 1,
    neutral: 0,
    negative: -1
  };

  const sentimentValue = sentimentMap[type];

  if (sentimentValue === undefined) {
    return res.status(400).json({ error: "Invalid sentiment type" });
  }

  try {
    // Tìm review với sentiment tương ứng và populate thông tin sản phẩm
    const reviews = await Review.find({ sentiment: sentimentValue })
      .populate('productId');  // Populate the product information based on productId

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews by sentiment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



