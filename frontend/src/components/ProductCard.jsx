import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const { user } = useUserStore();
  const { addToCart } = useCartStore();

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng", { id: "login" });
      return;
    } else {
      // thêm vào giỏ hàng
      addToCart(product);
    }
  };

  return (
    <div className='flex flex-col w-full bg-gray-800 rounded-lg border border-gray-700 shadow-lg overflow-hidden'>
      <Link to={`product/${product._id}`}>
        <div className='relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl'>
          <img className='object-cover w-full' src={product.image} alt='product image' />
          <div className='absolute inset-0 bg-black bg-opacity-20' />
        </div>

        <div className='mt-4 px-5 pb-5 flex flex-col flex-grow'>
          <h5 className='text-xl font-semibold tracking-tight text-white truncate'>{product.name}</h5>
          <div className='mt-2 mb-5 flex items-center justify-between'>
            <p>
              <span className='text-3xl font-bold text-emerald-400'>{product.price} VND</span>
            </p>
          </div>
        </div>
      </Link>

      <button
        className='flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300'
        onClick={handleAddToCart}
      >
        <ShoppingCart size={22} className='mr-2' />
        Thêm vào giỏ hàng
      </button>
    </div>
  );
};

export default ProductCard;
