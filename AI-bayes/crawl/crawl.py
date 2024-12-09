from selenium import webdriver
from selenium.webdriver.common.by import By
import pandas as pd
import time

def crawl_comments_selenium(url):
    comments = []
    seen_comments = set()  # Tập hợp để lưu bình luận đã thấy

    # Khởi tạo trình điều khiển Chrome
    driver = webdriver.Chrome()
    driver.get(url)
    
    # Đợi một chút để trang tải
    time.sleep(3)

    while True:
        # Tìm tất cả các mục bình luận
        review_items = driver.find_elements(By.CLASS_NAME, 'review-item')
        print(f"Found {len(review_items)} reviews on the page.")

        for item in review_items:
            try:
                # Lấy thông tin bình luận
                user = item.find_element(By.CLASS_NAME, 'ru-username').text
                rating = item.find_element(By.CLASS_NAME, 'review-points').text
                comment_text = item.find_element(By.CLASS_NAME, 'rd-des').find_element(By.TAG_NAME, 'span').text
                comment_time = item.find_element(By.CLASS_NAME, 'ru-time').text

                # Tạo tuple cho bình luận
                comment_tuple = (user, rating, comment_text, comment_time)

                # Kiểm tra xem bình luận đã thấy hay chưa
                if comment_tuple not in seen_comments:
                    seen_comments.add(comment_tuple)
                    comments.append({
                        'user': user,
                        'rating': rating,
                        'comment': comment_text,
                        'time': comment_time,
                    })
            except Exception as e:
                print(f"Error extracting comment: {e}")
                continue

        # Tìm và nhấn nút "Xem thêm bình luận" nếu có
        try:
            load_more_button = driver.find_element(By.CLASS_NAME, 'fd-btn-more')
            load_more_button.click()
            time.sleep(3)  # Đợi để tải thêm bình luận
        except Exception as e:
            print("No more pages or error:", e)
            break  # Không còn bình luận nào nữa

    driver.quit()
    return comments

# Thực thi chính
url = "https://www.foody.vn/ho-chi-minh/xoi-chien-nha-sushi"
comments = crawl_comments_selenium(url)

# Lưu bình luận vào CSV
df = pd.DataFrame(comments)
df.to_csv('foody_comments.csv', index=False, encoding='utf-8-sig')

print("Crawling complete. Comments saved to 'foody_comments.csv'.")
print(f"Total comments collected: {len(comments)}")
