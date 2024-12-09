import pandas as pd
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from scipy.sparse import hstack
import os
import joblib  # Thêm thư viện joblib để lưu mô hình

# Hàm tải danh sách từ dừng
def load_vietnamese_stopwords():
    try:
        with open('vietnamese_stopwords.txt', 'r', encoding='utf-8') as f:
            stopwords = f.read().splitlines()
        return set(stopwords)
    except FileNotFoundError:
        print("Không tìm thấy tệp 'vietnamese_stopwords.txt'. Đảm bảo rằng tệp này nằm cùng thư mục.")
        return set()

# Định nghĩa stop words
stop_words = load_vietnamese_stopwords()

# Hàm làm sạch văn bản
def clean_text(text, stop_words):
    text = text.lower()  # Chuyển thành chữ thường
    text = re.sub(r'[^\w\s]', '', text)  # Xóa ký tự đặc biệt và số
    text = ' '.join([word for word in text.split() if word not in stop_words])  # Xóa các từ dừng
    return text

# Hàm huấn luyện mô hình
def train_model():
    print("Bắt đầu đọc dữ liệu từ file CSV...")
    df = pd.read_csv('C:/Users/Admin/AI-bayes/data/foody_comments.csv')
    print(f"Dữ liệu đã được đọc, số dòng: {len(df)}")

    df['comment'] = df['comment'].fillna('').astype(str)
    df['sentiment'] = df['rating'].apply(lambda rating: 'positive' if rating >= 8 else 'neutral' if rating == 5 else 'negative')

    # Tiền xử lý dữ liệu
    X_comment = df['comment']
    X_rating = df['rating'].values
    y = df['sentiment']
    
    # Vector hóa dữ liệu comment
    print("Đang vector hóa dữ liệu comment...")
    vectorizer = TfidfVectorizer()
    X_comment_vectorized = vectorizer.fit_transform(X_comment)
    
    # Chuẩn hóa rating để làm đặc trưng số
    print("Chuẩn hóa dữ liệu rating...")
    scaler = StandardScaler()
    X_rating_scaled = scaler.fit_transform(X_rating.reshape(-1, 1))
    
    # Kết hợp rating và comment
    X_combined = hstack([X_comment_vectorized, X_rating_scaled])
    
    # Tách dữ liệu thành bộ huấn luyện và kiểm tra
    print("Tách dữ liệu thành bộ huấn luyện và kiểm tra...")
    X_train, X_test, y_train, y_test = train_test_split(X_combined, y, test_size=0.2, random_state=42)
    
    # Huấn luyện mô hình
    print("Đang huấn luyện mô hình...")
    model = LogisticRegression()
    model.fit(X_train, y_train)
    
    # Lưu mô hình, vectorizer và scaler
    print("Đang lưu mô hình, vectorizer và scaler...")
    if not os.path.exists('model'):
        os.makedirs('model')  # Tạo thư mục nếu chưa có
    joblib.dump(model, 'model/logistic_regression_model.pkl')
    joblib.dump(vectorizer, 'model/vectorizer.pkl')
    joblib.dump(scaler, 'model/scaler.pkl')
    
    print("Mô hình đã được huấn luyện và lưu thành công.")
    return model, vectorizer, scaler

# Huấn luyện mô hình và lưu
train_model()
