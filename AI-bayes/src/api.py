from flask import Flask, request, jsonify
from flask_cors import CORS  # Thêm import CORS
import re
import joblib
from scipy.sparse import hstack  # Import hstack từ scipy.sparse
import os

app = Flask(__name__)

# Kích hoạt CORS cho toàn bộ ứng dụng
CORS(app)

# Tải stop words
def load_vietnamese_stopwords():
    try:
        with open('vietnamese_stopwords.txt', 'r', encoding='utf-8') as f:
            stopwords = f.read().splitlines()
        return set(stopwords)
    except FileNotFoundError:
        print("Không tìm thấy tệp 'vietnamese_stopwords.txt'. Đảm bảo rằng tệp này nằm cùng thư mục.")
        return set()

stop_words = load_vietnamese_stopwords()

# Tải mô hình, vectorizer và scaler từ các tệp đã lưu
def load_model():
    model_path = 'model/logistic_regression_model.pkl'
    vectorizer_path = 'model/vectorizer.pkl'
    scaler_path = 'model/scaler.pkl'
    
    if os.path.exists(model_path) and os.path.exists(vectorizer_path) and os.path.exists(scaler_path):
        model = joblib.load(model_path)
        vectorizer = joblib.load(vectorizer_path)
        scaler = joblib.load(scaler_path)
        return model, vectorizer, scaler
    else:
        raise FileNotFoundError("Mô hình, vectorizer hoặc scaler không tìm thấy!")

# Tải mô hình
model, vectorizer, scaler = load_model()

# Hàm làm sạch văn bản
def clean_text(text, stop_words):
    text = text.lower()  # Chuyển thành chữ thường
    text = re.sub(r'[^\w\s]', '', text)  # Xóa ký tự đặc biệt và số
    text = ' '.join([word for word in text.split() if word not in stop_words])  # Xóa các từ dừng
    return text

# API endpoint để nhận yêu cầu từ Postman
@app.route('/predict', methods=['POST'])
def predict():
    # Nhận dữ liệu JSON từ Postman
    data = request.get_json()
    comment = data.get('comment', '')
    rating = data.get('rating', None)
    
    if comment and rating is not None:
        print("Received comment:", comment)  # In thông tin comment nhận được từ Postman
        
        # Làm sạch văn bản
        cleaned_comment = clean_text(comment, stop_words)
        print("Processed comment:", cleaned_comment)  # In thông tin comment sau khi đã làm sạch
        
        # Vector hóa dữ liệu đầu vào (comment)
        vectorized_input_comment = vectorizer.transform([cleaned_comment])
        
        # Chuẩn hóa rating
        scaled_input_rating = scaler.transform([[rating]])
        
        # Kết hợp comment và rating
        combined_input = hstack([vectorized_input_comment, scaled_input_rating])
        
        # Dự đoán sử dụng mô hình đã huấn luyện
        prediction = model.predict(combined_input)[0]
        sentiment = {'positive': 1, 'neutral': 0, 'negative': -1}[prediction]  # Chuyển thành giá trị số
        
        return jsonify({"prediction": sentiment}), 200
    else:
        return jsonify({"error": "Comment and rating are required"}), 400

if __name__ == '__main__':
    app.run(debug=True)
