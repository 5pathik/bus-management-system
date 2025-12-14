import mysql.connector

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="bus_management"
)

def get_cursor():
    return db.cursor(dictionary=True)
