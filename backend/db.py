# backend/db.py
import mysql.connector

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",          # put your password
    database="bus_management"
)

def get_cursor(dictionary=True):
    return db.cursor(dictionary=dictionary)
