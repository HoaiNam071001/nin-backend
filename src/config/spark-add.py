# from pyspark.sql import SparkSession
# from pyspark.sql import Row
# from datetime import datetime

# # Tạo SparkSession
# spark = SparkSession.builder \
#     .appName("User Activity Log") \
#     .config("spark.hadoop.fs.defaultFS", "hdfs://localhost:9000") \
#     .getOrCreate()

# # Dữ liệu lịch sử tìm kiếm
# user_activity_data = [
#     Row(user_id=1, action="search", keyword="python tutorial", timestamp=datetime.now().strftime('%Y-%m-%d %H:%M:%S')),
#     Row(user_id=1, action="search", keyword="data science", timestamp=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
# ]

# # Chuyển dữ liệu thành DataFrame
# user_activity_df = spark.createDataFrame(user_activity_data)

# # Lưu lịch sử tìm kiếm cho từng người dùng vào file riêng biệt
# for user_id in user_activity_df.select("user_id").distinct().collect():
#     # Lọc dữ liệu của người dùng hiện tại
#     user_data = user_activity_df.filter(user_activity_df.user_id == user_id.user_id)
    
#     # Đường dẫn tới file của người dùng
#     file_path = f"hdfs://localhost:9000/history/user_{user_id.user_id}.json"
    
#     # Kiểm tra nếu file đã tồn tại và xóa nó trước khi ghi lại dữ liệu (tuỳ chọn)
#     # fs = spark._jvm.org.apache.hadoop.fs.FileSystem.get(spark._jsc.hadoopConfiguration())
#     # path = spark._jvm.org.apache.hadoop.fs.Path(file_path)
#     # if fs.exists(path):
#     #     fs.delete(path, True)  # Xóa file nếu tồn tại
    
#     # Ghi dữ liệu vào file cho người dùng
#     user_data.coalesce(1).write.mode("overwrite").json(file_path)

# # Dừng SparkSession
# spark.stop()




from pyspark.sql import SparkSession
from pyspark.sql import Row
from datetime import datetime

# Tạo SparkSession
spark = SparkSession.builder \
    .appName("User Activity Log") \
    .config("spark.hadoop.fs.defaultFS", "hdfs://localhost:9000") \
    .getOrCreate()

# Dữ liệu lịch sử tìm kiếm
user_activity_data = [
    Row(user_id=1, action="search", keyword="python tutorial", timestamp=datetime.now().strftime('%Y-%m-%d %H:%M:%S')),
    Row(user_id=1, action="search", keyword="python tutorial", timestamp=datetime.now().strftime('%Y-%m-%d %H:%M:%S')),
    Row(user_id=1, action="search", keyword="python tutorial", timestamp=datetime.now().strftime('%Y-%m-%d %H:%M:%S')),
    Row(user_id=1, action="search", keyword="python tutorial", timestamp=datetime.now().strftime('%Y-%m-%d %H:%M:%S')),
    Row(user_id=1, action="search", keyword="python tutorial", timestamp=datetime.now().strftime('%Y-%m-%d %H:%M:%S')),
    Row(user_id=1, action="search", keyword="python tutorial", timestamp=datetime.now().strftime('%Y-%m-%d %H:%M:%S')),
    Row(user_id=1, action="search", keyword="python tutorial", timestamp=datetime.now().strftime('%Y-%m-%d %H:%M:%S')),
    Row(user_id=1, action="search", keyword="python tutorial", timestamp=datetime.now().strftime('%Y-%m-%d %H:%M:%S')),

    Row(user_id=1, action="search", keyword="data science", timestamp=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
]

# Chuyển dữ liệu thành DataFrame
user_activity_df = spark.createDataFrame(user_activity_data)

# Lưu dữ liệu vào HDFS dưới định dạng Parquet
parquet_file_path = "hdfs://localhost:9000/history/user_activity_parquet1"
user_activity_df.coalesce(1).write.mode("append").parquet(parquet_file_path)

# Dừng SparkSession
spark.stop()
