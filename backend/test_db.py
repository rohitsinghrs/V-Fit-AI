
from database import test_db_connection

try:
    result = test_db_connection()
    print("Database connection successful!")
    print("Test result:", result)
except Exception as error:
    print("Database connection failed!")
    print("Error:", error)
