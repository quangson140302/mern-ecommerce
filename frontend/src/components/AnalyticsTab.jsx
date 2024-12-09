import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { Users, Package, ShoppingCart, DollarSign, Smile, Meh, Frown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const AnalyticsTab = () => {
  const [analyticsData, setAnalyticsData] = useState({
    users: 0,
    products: 0,
    totalSales: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dailySalesData, setDailySalesData] = useState([]);
  const [sentimentData, setSentimentData] = useState({ positive: 0, neutral: 0, negative: 0 });

  const [selectedReviews, setSelectedReviews] = useState([]);
  const [selectedSentiment, setSelectedSentiment] = useState(null);
  const [isReviewLoading, setIsReviewLoading] = useState(false);

  // Hàm xử lý click vào card sentiment
  const handleCardClick = async (type) => {
    setIsReviewLoading(true);  // Bắt đầu loading
    setSelectedSentiment(type);
    try {
      const response = await axios.get(`/review/sentiment/${type}`);
      setSelectedReviews(response.data);
    } catch (error) {
      console.error(`Error fetching ${type} reviews:`, error);
    } finally {
      setIsReviewLoading(false);  // Kết thúc loading
    }
  };

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await axios.get("/analytics");
        setAnalyticsData(response.data.analyticsData);
        setDailySalesData(response.data.dailySalesData);

        // Gọi API analyze để lấy dữ liệu sentiment
        const sentimentResponse = await axios.get("/review/analyze");
        processSentimentData(sentimentResponse.data);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  // Xử lý dữ liệu sentiment để đếm số lượng từng loại sentiment
  const processSentimentData = (data) => {
    let positive = 0, neutral = 0, negative = 0;
    data.forEach(review => {
      if (review.sentiment === 1) positive++;
      else if (review.sentiment === 0) neutral++;
      else if (review.sentiment === -1) negative++;
    });
    setSentimentData({ positive, neutral, negative });
  };

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <AnalyticsCard title='Tổng số người dùng' value={analyticsData.users.toLocaleString()} icon={Users} color='from-emerald-500 to-teal-700' />
        <AnalyticsCard title='Tổng số sản phẩm' value={analyticsData.products.toLocaleString()} icon={Package} color='from-emerald-500 to-green-700' />
        <AnalyticsCard title='Số lượng đã bán' value={analyticsData.totalSales.toLocaleString()} icon={ShoppingCart} color='from-emerald-500 to-cyan-700' />
        <AnalyticsCard title='Tổng doanh thu' value={`${analyticsData.totalRevenue.toLocaleString()} VND`} icon={DollarSign} color='from-emerald-500 to-lime-700' />
      </div>

      {/* Các card sentiment */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8'>
        <AnalyticsCard title='Đánh giá tích cực' value={sentimentData.positive} icon={Smile} color='from-green-400 to-green-600' onClick={() => handleCardClick('positive')} />
        <AnalyticsCard title='Đánh giá trung bình' value={sentimentData.neutral} icon={Meh} color='from-yellow-400 to-yellow-600' onClick={() => handleCardClick('neutral')} />
        <AnalyticsCard title='Đánh giá tiêu cực' value={sentimentData.negative} icon={Frown} color='from-red-400 to-red-600' onClick={() => handleCardClick('negative')} />
      </div>

      {/* Hiển thị danh sách review khi click */}
      {selectedSentiment && (
  <div className='bg-gray-800/60 rounded-lg p-6 shadow-lg mt-8'>
    <h3 className='text-white text-lg font-semibold mb-4 capitalize'>
      {selectedSentiment} Đánh giá
    </h3>
    {isReviewLoading ? (
      <div className='text-white'>Đang tải đánh giá...</div>
    ) : (
      <ul className='space-y-4'>
        {selectedReviews.map((review) => (
          <li key={review._id} className='p-4 bg-gray-700 rounded-lg'>
            <p className='text-white'>
              <strong>Bình luận:</strong> {review.comment}
            </p>
            <p className='text-white'>
              <strong>Đánh giá:</strong> {review.rating}
            </p>
            <p className='text-white'>
              <strong>Sản phẩm:</strong> {review.productId.name}
            </p>
            <p className='text-white'>
              <strong>Mô tả:</strong> {review.productId.description}
            </p>
            <p className='text-white'>
              <strong>Giá:</strong> {review.productId.price.toLocaleString()} VND
            </p>
            <img
              src={review.productId.image}
              alt={review.productId.name}
              className='mt-2 max-w-xs rounded-md'
            />
          </li>
        ))}
      </ul>
    )}
  </div>
)}


      <motion.div
        className='bg-gray-800/60 rounded-lg p-6 shadow-lg'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <ResponsiveContainer width='100%' height={400}>
          <LineChart data={dailySalesData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='name' stroke='#D1D5DB' />
            <YAxis yAxisId='left' stroke='#D1D5DB' />
            <YAxis yAxisId='right' orientation='right' stroke='#D1D5DB' />
            <Tooltip />
            <Legend />
            <Line yAxisId='left' type='monotone' dataKey='sales' stroke='#10B981' activeDot={{ r: 8 }} name='Sales' />
            <Line yAxisId='right' type='monotone' dataKey='revenue' stroke='#3B82F6' activeDot={{ r: 8 }} name='Revenue' />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

export default AnalyticsTab;

// Component AnalyticsCard giữ nguyên
const AnalyticsCard = ({ title, value, icon: Icon, color, onClick }) => (
  <motion.div
    className={`bg-gray-800 rounded-lg p-6 shadow-lg overflow-hidden relative cursor-pointer ${color}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    onClick={onClick} // Thêm sự kiện click
  >
    <div className='flex justify-between items-center'>
      <div className='z-10'>
        <p className='text-emerald-300 text-sm mb-1 font-semibold'>{title}</p>
        <h3 className='text-white text-3xl font-bold'>{value}</h3>
      </div>
    </div>
    <div className='absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-900 opacity-30' />
    <div className='absolute -bottom-4 -right-4 text-emerald-800 opacity-50'>
      <Icon className='h-32 w-32' />
    </div>
  </motion.div>
);
