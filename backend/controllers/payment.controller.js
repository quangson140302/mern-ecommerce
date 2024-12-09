import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import { stripe } from "../lib/stripe.js";

// Tạo session thanh toán
export const createCheckoutSession = async (req, res) => {
	try {
		const { products, couponCode } = req.body;

		// Kiểm tra danh sách sản phẩm
		if (!Array.isArray(products) || products.length === 0) {
			return res.status(400).json({ error: "Danh sách sản phẩm không hợp lệ hoặc rỗng" });
		}

		let totalAmount = 0;

		// Tạo danh sách sản phẩm thanh toán
		const lineItems = products.map((product) => {
			const amount = product.price; // Không nhân với 100 vì VND đã là đơn vị nhỏ nhất
			totalAmount += amount * product.quantity;

			return {
				price_data: {
					currency: "vnd", // Đơn vị tiền tệ VND
					product_data: {
						name: product.name,
						images: [product.image],
					},
					unit_amount: amount, // Số tiền theo đơn vị VND
				},
				quantity: product.quantity || 1,
			};
		});

		// Xử lý mã giảm giá
		let coupon = null;
		if (couponCode) {
			coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
			if (coupon) {
				totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100);
			}
		}

		// Tạo session thanh toán trên Stripe
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"], // Phương thức thanh toán
			line_items: lineItems,
			mode: "payment", // Chế độ thanh toán ngay
			success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
			discounts: coupon
				? [
						{
							coupon: await createStripeCoupon(coupon.discountPercentage),
						},
				  ]
				: [],
			metadata: {
				userId: req.user._id.toString(),
				couponCode: couponCode || "",
				products: JSON.stringify(
					products.map((p) => ({
						id: p._id,
						quantity: p.quantity,
						price: p.price,
					}))
				),
			},
		});

		// Tạo mã giảm giá mới nếu tổng tiền đạt ngưỡng
		if (totalAmount >= 20000000) {
			await createNewCoupon(req.user._id);
		}

		res.status(200).json({ id: session.id, totalAmount });
	} catch (error) {
		console.error("Lỗi xử lý thanh toán:", error);
		res.status(500).json({ message: "Lỗi xử lý thanh toán", error: error.message });
	}
};

// Xử lý thanh toán thành công
export const checkoutSuccess = async (req, res) => {
	try {
		const { sessionId } = req.body;
		const session = await stripe.checkout.sessions.retrieve(sessionId);

		if (session.payment_status === "paid") {
			if (session.metadata.couponCode) {
				await Coupon.findOneAndUpdate(
					{
						code: session.metadata.couponCode,
						userId: session.metadata.userId,
					},
					{
						isActive: false,
					}
				);
			}

			// Tạo đơn hàng mới
			const products = JSON.parse(session.metadata.products);
			const newOrder = new Order({
				user: session.metadata.userId,
				products: products.map((product) => ({
					product: product.id,
					quantity: product.quantity,
					price: product.price, // Lưu giá VND
				})),
				totalAmount: session.amount_total, // Không chia 100 vì VND là đơn vị nhỏ nhất
				stripeSessionId: sessionId,
			});

			await newOrder.save();

			res.status(200).json({
				success: true,
				message: "Thanh toán thành công, đơn hàng đã được tạo, mã giảm giá bị hủy nếu có.",
				orderId: newOrder._id,
			});
		}
	} catch (error) {
		console.error("Lỗi xử lý thanh toán thành công:", error);
		res.status(500).json({ message: "Lỗi xử lý thanh toán thành công", error: error.message });
	}
};

// Tạo mã giảm giá trên Stripe
async function createStripeCoupon(discountPercentage) {
	const coupon = await stripe.coupons.create({
		percent_off: discountPercentage,
		duration: "once",
	});
	return coupon.id;
}

// Tạo mã giảm giá mới cho người dùng
async function createNewCoupon(userId) {
	await Coupon.findOneAndDelete({ userId });

	const newCoupon = new Coupon({
		code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
		discountPercentage: 10,
		expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 ngày
		userId: userId,
	});

	await newCoupon.save();
	return newCoupon;
}
