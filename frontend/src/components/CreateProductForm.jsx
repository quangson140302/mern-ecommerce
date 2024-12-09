import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Import AnimatePresence
import { PlusCircle, Upload, Loader, CheckCircle, XCircle } from "lucide-react"; // Thêm icon CheckCircle và XCircle
import { useProductStore } from "../stores/useProductStore";

const categories = ["Thit", "Ca", "Do-Kho", "Gia-Vi", "Banh-Keo", "Do-Uong", "Rau-Cu"];

const CreateProductForm = () => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
  });

  const [message, setMessage] = useState({ text: "", type: "" }); // State cho popup thông báo
  const { createProduct, loading } = useProductStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" }); // Xóa thông báo cũ
    try {
      await createProduct(newProduct);
      setNewProduct({ name: "", description: "", price: "", category: "", image: "" });
      setMessage({ text: "Sản phẩm đã được tạo thành công!", type: "success" });
    } catch (error) {
      setMessage({ text: "Lỗi khi tạo sản phẩm. Vui lòng thử lại!", type: "error" });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewProduct({ ...newProduct, image: reader.result });
      reader.readAsDataURL(file); // Chuyển đổi file thành base64
    }
  };

  // Tự động ẩn thông báo sau 3 giây
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 3000); // 3 giây

      return () => clearTimeout(timer); // Xóa timer khi component unmount hoặc message thay đổi
    }
  }, [message]);

  return (
    <motion.div
      className='bg-gray-800 shadow-lg rounded-lg p-8 mb-8 max-w-xl mx-auto'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className='text-2xl font-semibold mb-6 text-emerald-300'>Tạo Sản Phẩm Mới</h2>

      <form onSubmit={handleSubmit} className='space-y-4'>
        {/* Tên Sản Phẩm */}
        <div>
          <label htmlFor='name' className='block text-sm font-medium text-gray-300'>
            Tên Sản Phẩm
          </label>
          <input
            type='text'
            id='name'
            name='name'
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            className='mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
            required
          />
        </div>

        {/* Mô Tả */}
        <div>
          <label htmlFor='description' className='block text-sm font-medium text-gray-300'>
            Mô Tả
          </label>
          <textarea
            id='description'
            name='description'
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            rows='3'
            className='mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
            required
          />
        </div>

        {/* Giá */}
        <div>
          <label htmlFor='price' className='block text-sm font-medium text-gray-300'>
            Giá
          </label>
          <input
            type='number'
            id='price'
            name='price'
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            step='0.01'
            className='mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
            required
          />
        </div>

        {/* Loại Sản Phẩm */}
        <div>
          <label htmlFor='category' className='block text-sm font-medium text-gray-300'>
            Loại Sản Phẩm
          </label>
          <select
            id='category'
            name='category'
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
            className='mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
            required
          >
            <option value=''>Chọn loại sản phẩm</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Upload Ảnh */}
        <div className='mt-1 flex items-center'>
          <input type='file' id='image' className='sr-only' accept='image/*' onChange={handleImageChange} />
          <label
            htmlFor='image'
            className='cursor-pointer bg-gray-700 py-2 px-3 border border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
          >
            <Upload className='h-5 w-5 inline-block mr-2' />
            Tải Lên Ảnh
          </label>
          {newProduct.image && <span className='ml-3 text-sm text-gray-400'>Ảnh đã tải lên</span>}
        </div>

        {/* Nút Tạo Sản Phẩm */}
        <button
          type='submit'
          className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50'
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader className='mr-2 h-5 w-5 animate-spin' aria-hidden='true' />
              Đang Tải...
            </>
          ) : (
            <>
              <PlusCircle className='mr-2 h-5 w-5' />
              Tạo Sản Phẩm
            </>
          )}
        </button>
      </form>

      {/* Popup Thông Báo */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className={`fixed bottom-8 right-8 px-6 py-4 rounded-lg shadow-lg text-white flex items-center ${
              message.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {message.type === "success" ? <CheckCircle className='w-5 h-5 mr-3' /> : <XCircle className='w-5 h-5 mr-3' />}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CreateProductForm;
