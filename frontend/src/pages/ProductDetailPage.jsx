import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { ShoppingCart } from "lucide-react";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";  // Import toast
import { useUserStore } from "../stores/useUserStore";  // Import user store
import { useCartStore } from "../stores/useCartStore";  // Import cart store

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [newReview, setNewReview] = useState({ comment: "", rating: 1 });
  const [reviews, setReviews] = useState([]);
  const [reviewMessage, setReviewMessage] = useState("");

  const { user } = useUserStore();  // Lấy thông tin người dùng từ store
  const { addToCart } = useCartStore();  // Lấy hàm thêm giỏ hàng từ store

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios(`http://localhost:5000/api/products/${id}`);
        setProduct(response.data.productDetail);
        setReviews(response.data.reviews);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };
    fetchProduct();
  }, [id]);

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "VND",
  }).format(product?.price);

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setNewReview((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post(`/review/${id}`, newReview);
      setNewReview({ comment: "", rating: 1 });
      const response = await axios(`http://localhost:5000/api/products/${id}`);
      setReviews(response.data.reviews);
      toast.success("Review submitted successfully!");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Error submitting review. Please try again.");
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng", { id: "login" });
      return;
    }
    try {
      addToCart(product);  // Thêm sản phẩm vào giỏ hàng
    } catch (error) {
      console.error("Error adding product to cart:", error);
      toast.error("Thêm sản phẩm vào giỏ hàng thất bại.");
    }
  };

  if (!product) {
    return <div className="text-center text-white">Loading...</div>;
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-900 text-white flex items-center justify-center py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex flex-col md:flex-row w-full max-w-6xl rounded-lg overflow-hidden shadow-lg bg-gray-800">
        {/* Phần chi tiết sản phẩm */}
        <div className="md:w-1/2 p-8">
          <div className="relative h-72 overflow-hidden rounded-xl shadow-lg mb-6">
            <img className="object-cover w-full h-full" src={product.image} alt="Product" />
            <div className="absolute inset-0 bg-black bg-opacity-30" />
          </div>

          <h5 className="text-3xl font-bold text-white mb-4">{product.name}</h5>
          <p className="text-gray-400 mb-2">Danh mục: {product.category}</p>
          <p className="text-4xl font-bold text-emerald-400 mb-4">{formattedPrice}</p>
          <p className="text-gray-300 mb-6">{product.description}</p>

          <button
            className="flex items-center justify-center w-full md:w-auto rounded-lg bg-emerald-600 px-6 py-3 text-lg font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500 transition duration-300"
            onClick={handleAddToCart}
          >
            <ShoppingCart size={24} className="mr-2" />
            Thêm vào giỏ hàng
          </button>
        </div>

        {/* Phần đánh giá sản phẩm */}
        <div className="md:w-1/2 p-8 bg-gray-900">
          <h3 className="text-2xl font-semibold mb-6 text-white">Đánh giá</h3>
          <div className="bg-gray-800 p-6 rounded-lg mb-6 overflow-auto max-h-72">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id} className="border-b border-gray-700 py-4">
                  <p className="text-emerald-400 font-semibold">Điểm: {review.rating} / 10</p>
                  <p className="text-gray-300">{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">Chưa có đánh giá nào.</p>
            )}
          </div>

          {/* Form đánh giá */}
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label htmlFor="rating" className="block text-gray-300">Điểm (1-10)</label>
              <input
                type="number"
                id="rating"
                name="rating"
                value={newReview.rating}
                min="1"
                max="10"
                onChange={handleReviewChange}
                className="w-full p-3 mt-2 rounded-md border border-gray-700 bg-gray-700 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="comment" className="block text-gray-300">Bình luận</label>
              <textarea
                id="comment"
                name="comment"
                value={newReview.comment}
                onChange={handleReviewChange}
                className="w-full p-3 mt-2 rounded-md border border-gray-700 bg-gray-700 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                rows="4"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full px-5 py-3 text-center text-lg font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:outline-none transition duration-300"
            >
              Gửi đánh giá
            </button>
            {reviewMessage && (
              <p className="mt-4 text-center text-sm font-semibold text-emerald-400">
                {reviewMessage}
              </p>
            )}
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetailPage;
