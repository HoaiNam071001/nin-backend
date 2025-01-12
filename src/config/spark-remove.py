from pyspark.sql import SparkSession
from py4j.java_gateway import java_import

# Khởi tạo SparkSession
spark = SparkSession.builder.appName("DeleteFileExample").getOrCreate()

# Đưa vào các lớp cần thiết
java_import(spark._jvm, "org.apache.hadoop.fs.FileSystem")
java_import(spark._jvm, "org.apache.hadoop.fs.Path")

# Lấy đối tượng hdfs
hadoop_conf = spark._jsc.hadoopConfiguration()
fs = spark._jvm.org.apache.hadoop.fs.FileSystem.get(hadoop_conf)

# Định nghĩa đường dẫn file
file_path = "hdfs://localhost:9000/history/user_2.json"

# Tạo đối tượng Path
path = spark._jvm.org.apache.hadoop.fs.Path(file_path)

# Kiểm tra nếu file tồn tại và xóa file
if fs.exists(path):
    fs.delete(path, True)  # True sẽ xóa cả thư mục nếu có
    print(f"File {file_path} đã được xóa.")
else:
    print(f"File {file_path} không tồn tại.")
