import { useEffect } from "react";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";

const categories = [
	{ href: "/Thit", name: "Thịt", imageUrl: "/thit.webp" },
	{ href: "/Ca", name: "Cá - Hải sản", imageUrl: "/ca.png" },
	{ href: "/Do-Kho", name: "Đồ khô", imageUrl: "/dokho.webp" },
	{ href: "/Gia-Vi", name: "Gia vị", imageUrl: "/giavi.webp" },
	{ href: "/Banh-Keo", name: "Bánh kẹo", imageUrl: "/banhkeo.webp" },
	{ href: "/Do-Uong", name: "Đồ uống", imageUrl: "/douong.webp" },
	{ href: "/Rau-Cu", name: "Rau củ", imageUrl: "/raucu.webp" },
];

const HomePage = () => {
	const { fetchFeaturedProducts, products, isLoading } = useProductStore();

	useEffect(() => {
		fetchFeaturedProducts();
	}, [fetchFeaturedProducts]);

	return (
		<div className='relative min-h-screen text-white overflow-hidden'>
			<div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
				<h1 className='text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4'>
				Khám Phá Các Món Ăn Ngon Của Chúng Tôi
				</h1>
				<p className='text-center text-xl text-gray-300 mb-12'>
				Tận hưởng những món ăn ngon miệng được chuẩn bị từ nguyên liệu tươi ngon
				</p>

				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
					{categories.map((category) => (
						<CategoryItem category={category} key={category.name} />
					))}
				</div>

				{!isLoading && products.length > 0 && <FeaturedProducts featuredProducts={products} />}
			</div>
		</div>
	);
};
export default HomePage;
