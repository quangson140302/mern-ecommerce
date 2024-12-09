import pandas as pd
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler
from scipy.sparse import hstack

# Hàm tải danh sách từ dừng
def load_vietnamese_stopwords():
    try:
        with open('vietnamese_stopwords.txt', 'r', encoding='utf-8') as f:
            stopwords = f.read().splitlines()
        return set(stopwords)
    except FileNotFoundError:
        print("Không tìm thấy tệp 'vietnamese_stopwords.txt'. Đảm bảo rằng tệp này nằm cùng thư mục.")
        return set()

# Hàm làm sạch văn bản
def clean_text(text, stop_words):
    text = text.lower()  # Chuyển thành chữ thường
    text = re.sub(r'[^\w\s]', '', text)  # Xóa ký tự đặc biệt và số
    text = ' '.join([word for word in text.split() if word not in stop_words])  # Xóa các từ dừng
    return text

# Hàm tiền xử lý dữ liệu
def preprocess_data(df, stop_words):
    print("Bắt đầu tiền xử lý dữ liệu...")  # Thông báo khi bắt đầu tiền xử lý
    
    # Xử lý giá trị thiếu và chuyển toàn bộ cột 'comment' sang chuỗi
    if 'comment' in df.columns:
        df['comment'] = df['comment'].fillna('').astype(str)
        # Áp dụng hàm clean_text
        df['comment'] = df['comment'].apply(lambda x: clean_text(x, stop_words))
    else:
        print("Không tìm thấy cột 'comment' trong dữ liệu.")
        return df
    
    print("Tiền xử lý dữ liệu hoàn tất.")  # Thông báo khi hoàn tất tiền xử lý
    return df
