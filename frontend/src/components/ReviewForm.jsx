// src/components/ReviewForm.jsx
import  { useState } from "react";
import axios from "axios";

function ReviewForm() {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5); // Mặc định 5
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPrediction(null);

    try {
      const response = await axios.post("/api/reviews/predict", { comment, rating });
      setPrediction(response.data.prediction); // Nhận kết quả từ backend
    } catch (error) {
      setError("Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.");
      console.error("Error:", error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center">Đánh giá sản phẩm</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Nhận xét:</label>
          <textarea
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            placeholder="Nhập bình luận..."
          />
        </div>
        <div>
          <label className="block text-gray-700">Đánh giá (1-10):</label>
          <input
            type="number"
            min="1"
            max="10"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Gửi đánh giá
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {prediction !== null && (
        <p className="text-center mt-4 text-lg font-semibold">
          Kết quả phân loại:{" "}
          <span className={
            prediction === 1
              ? "text-green-500"
              : prediction === 0
              ? "text-gray-500"
              : "text-red-500"
          }>
            {prediction === 1 ? "Tích cực" : prediction === 0 ? "Trung lập" : "Tiêu cực"}
          </span>
        </p>
      )}
    </div>
  );
}

export default ReviewForm;
