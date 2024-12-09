import { Link } from "react-router-dom";

const ProductCardDetail = ({ product }) => {
  return (
    <Link to={`/product/${product._id}`} className="block">
      <div className="bg-white shadow-md rounded-lg p-4">
        <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-t-lg" />
        <h3 className="text-lg font-semibold mt-2">{product.name}</h3>
        <p className="text-gray-600">{product.price} VND</p>
      </div>
    </Link>
  );
};

export default ProductCardDetail;

