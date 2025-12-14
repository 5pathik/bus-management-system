import mysql.connector

def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",   # your MySQL password
        database="bus_management"
    )
