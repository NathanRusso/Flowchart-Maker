"""
This file contains the logic to get data from the course database.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import mariadb
import os


COURSE_QUERY = (
    "SELECT c.quarter, d.code, c.course, c.credits, c.title, c.description, c.prerequisites, c.typically_offered, c.contact_hours "
    "FROM courses c JOIN departments d ON c.department = d.id "
    "WHERE d.code = ? AND c.course = ? ORDER BY c.quarter DESC LIMIT 1"
)
"""
COURSE_QUERY = (
    "SELECT c.quarter, d.code, c.course, c.credits, c.title, c.description "
    "FROM courses c JOIN departments d ON c.department = d.id "
    "WHERE d.code = ? AND c.course = ? ORDER BY c.quarter DESC LIMIT 1"
)
"""
pool = None

# Startup code
app = Flask(__name__)   # Setup flask app
CORS(app)               # Handle requests
load_dotenv()           # Load Environment variables


def connect_to_database():
    """
    Tries to connect to the course information database.
    """
    try:
        global pool
        pool = mariadb.ConnectionPool(
            pool_name="flowchart_pool",
            pool_size=5,
            pool_reset_connection=True,
            pool_validation_interval=500,
            connect_timeout=5,
            user=os.getenv("DATABASE_USER"),
            password=os.getenv("DATABASE_PASSWORD"),
            host=os.getenv("DATABASE_HOST"),
            port=3306,
            database=os.getenv("DATABASE_NAME"),
        )
        print(f"[SUCCESS] connect_to_database(): Connected to course database!")
    except Exception as e:
        pool = None
        print(f"[ERROR] connect_to_database(): Could not connect to course database: {e}!")


def disconnect_from_database():
    """
    Tries to disconnect from the course information database.
    """
    try:
        if pool: pool.close()
        print(f"[SUCCESS] disconnect_from_database(): Disconnected from the course database!")
    except Exception as e:
        print(f"[ERROR] disconnect_from_database(): Could not disconnect from the course database: {e}!")


# Startup (continue)
connect_to_database()   # Connection to the course information database


@app.route("/api/course", methods=["GET"])
def get_course_information():
    """
    This gets the most recent course information for the selected course.

    Args:
        discipline (str): The course discipline. Ex: ABCD.
        number (str): The course number. Ex: 999.

    Returns:
        The course's information or an error.
    """
    try:
        if pool is None: raise RuntimeError("Database pool has been not established")

        with pool.get_connection() as connection:
            if connection is None: raise RuntimeError("Database connection has been not established")
            with connection.cursor(dictionary=True) as cursor:
                if cursor is None: raise RuntimeError("Database cursor has been not established")

                discipline = request.args.get('discipline')
                number = request.args.get('number')
                cursor.execute(COURSE_QUERY, (discipline, number))
                courseInformation = cursor.fetchone()
                if courseInformation is None: raise ValueError(f"Could not find class information matching {discipline}-{number}")

                return jsonify(courseInformation), 200      # Ok
    except mariadb.Error:
        me = "Could not connect to database"
        print(f"[ERROR] get_course_information(): {me}!")
        return jsonify({"error": str(me)}), 503             # Service Unavailable
    except RuntimeError as re:
        print(f"[ERROR] get_course_information(): {re}!")
        return jsonify({"error": str(re)}), 503             # Service Unavailable
    except ValueError as ve:
        print(f"[ERROR] get_course_information(): {ve}!")
        return jsonify({"error": str(ve)}), 404             # Not Found
    except Exception as e:
        print(f"[ERROR] get_course_information(): Could not get course information: {e}!")
        return jsonify({"error": str(e)}), 500              # Internal Server Error


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)  # Development server only
