# ================== DATABASE ==================
import mysql.connector
from config import MYSQL_CONFIG

db = mysql.connector.connect(**MYSQL_CONFIG)

def get_cursor():
    return db.cursor(dictionary=True)
