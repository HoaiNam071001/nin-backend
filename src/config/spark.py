# from pyspark.sql import SparkSession

# # Tạo SparkSession và cấu hình kết nối với HDFS
# spark = SparkSession.builder \
#     .appName("Read from HDFS") \
#     .config("spark.hadoop.fs.defaultFS", "hdfs://localhost:9000") \
#     .getOrCreate()

# # Đọc file JSON từ HDFS
# file_path = "hdfs://localhost:9000/history/file1.json"
# data = spark.read.json(file_path)

# # Hiển thị dữ liệu
# data.show()

# # Dừng SparkSession
# spark.stop()

from pyspark.sql import SparkSession
from pyspark.sql import Row

# Tạo SparkSession và cấu hình kết nối với HDFS
spark = SparkSession.builder \
    .appName("Save to HDFS") \
    .config("spark.hadoop.fs.defaultFS", "hdfs://localhost:9000") \
    .getOrCreate()

# Tạo một DataFrame từ dữ liệu
data = [Row(id=1)]  # Tạo dữ liệu { id: 1 }

# Chuyển dữ liệu thành DataFrame
df = spark.createDataFrame(data)

# Lưu DataFrame lên HDFS dưới định dạng JSON
file_path = "hdfs://localhost:9000/history/file1.json"
df.write.json(file_path)

# Hiển thị thông báo thành công
print(f"File has been written to {file_path}")

# Dừng SparkSession
spark.stop()
