import mysql.connector

# ================= DATABASE CONNECTION =================
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="bus_management",
        autocommit=True   # 🔥 VERY IMPORTANT
    )

# ================= GET CURSOR =================
def get_cursor():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    return cursor, db
