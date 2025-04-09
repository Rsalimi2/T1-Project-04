from flask import Flask, jsonify, request
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, Float, select, insert, delete, update
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os
import pymysql
import hashlib 
from faker import Faker
from flasgger import Swagger
from flask_cors import CORS

# Load environment variables
load_dotenv()

# Database configuration
DB_USER = os.getenv('DB_USER', 'myuser')
DB_PASS = os.getenv('DB_PASS', 'mypassword')
DB_HOST = os.getenv('DB_HOST', 'db')  # Matches the service name in Docker Compose
DB_PORT = os.getenv('DB_PORT', '3306')
DB_NAME = os.getenv('DB_NAME', 'mydatabase')

# Ensure the database connection is made with correct privileges
DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
try:
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    metadata = MetaData(bind=engine)
except Exception as e:
    print(f"Error connecting to the database: {e}")
    exit(1)

# Initialize Flask, Faker, and Swagger
app = Flask(__name__)
Swagger(app)
CORS(app)  # Allow requests from React frontend

fake = Faker()

# Define the Student table
students = Table('students', metadata,
    Column('StudentID', Integer, primary_key=True, autoincrement=True),
    Column('Name', String(100), nullable=False),
    Column('Year', Integer, nullable=False),
    Column('GPA', Float, nullable=False),
    Column('PhoneNumber', String(15), nullable=False),
    Column('Address', String(255), nullable=False)
)

# Create the table if it does not exist
try:
    metadata.create_all(engine)
except Exception as e:
    print(f"Error creating table: {e}")
    exit(1)

def generate_student_record():
    return {
        'Name': fake.name(),
        'Year': fake.random_int(min=1, max=4),
        'GPA': round(fake.random.uniform(0.0, 4.0), 2),  # GPA between 0.0 and 4.0
        'PhoneNumber': fake.phone_number(),
        'Address': fake.address()
    }

@app.route('/students', methods=['POST'])
def create_student():
    """
    Create a new student record
    ---
    tags:
      - Students
    parameters:
      - name: body
        in: body
        required: true
        schema:
          id: Student
          required:
            - Name
            - Year
            - GPA
            - PhoneNumber
            - Address
          properties:
            Name:
              type: string
              description: Student's name
            Year:
              type: integer
              description: Student's year (1-4)
            GPA:
              type: number
              format: float
              description: Student's GPA (0.0-4.0)
            PhoneNumber:
              type: string
              description: Student's phone number
            Address:
              type: string
              description: Student's address
    responses:
      201:
        description: Student record created successfully
      500:
        description: Server error
    """
    try:
        data = request.get_json()
        stmt = insert(students).values(data)
        with engine.connect() as conn:
            conn.execute(stmt)
        return jsonify({"message": "Student record created successfully."}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/students', methods=['GET'])
def get_students():
    """
    Get all students
    ---
    tags:
      - Students
    responses:
      200:
        description: List of all students
      500:
        description: Server error
    """
    try:
        with engine.connect() as conn:
            result = conn.execute(select(students))
            data = [dict(row) for row in result]
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/students/<int:student_id>', methods=['GET'])
def get_student(student_id):
    """
    Get a specific student by ID
    ---
    tags:
      - Students
    parameters:
      - name: student_id
        in: path
        type: integer
        required: true
        description: ID of the student to retrieve
    responses:
      200:
        description: Student record
      404:
        description: Student not found
      500:
        description: Server error
    """
    try:
        with engine.connect() as conn:
            result = conn.execute(select(students).where(students.c.StudentID == student_id))
            student = result.fetchone()
            if student:
                return jsonify(dict(student)), 200
            return jsonify({"error": "Student not found."}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/students/<int:student_id>', methods=['PUT'])
def update_student(student_id):
    """
    Update an existing student record
    ---
    tags:
      - Students
    parameters:
      - name: student_id
        in: path
        type: integer
        required: true
        description: ID of the student to update
      - name: body
        in: body
        required: true
        schema:
          id: Student
          properties:
            Name:
              type: string
            Year:
              type: integer
            GPA:
              type: number
              format: float
            PhoneNumber:
              type: string
            Address:
              type: string
    responses:
      200:
        description: Student record updated successfully
      404:
        description: Student not found
      500:
        description: Server error
    """
    try:
        data = request.get_json()
        stmt = update(students).where(students.c.StudentID == student_id).values(data)
        with engine.connect() as conn:
            result = conn.execute(stmt)
        if result.rowcount:
            return jsonify({"message": "Student record updated successfully."}), 200
        return jsonify({"error": "Student not found."}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/students/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    """
    Delete a student record
    ---
    tags:
      - Students
    parameters:
      - name: student_id
        in: path
        type: integer
        required: true
        description: ID of the student to delete
    responses:
      200:
        description: Student record deleted successfully
      404:
        description: Student not found
      500:
        description: Server error
    """
    try:
        stmt = delete(students).where(students.c.StudentID == student_id)
        with engine.connect() as conn:
            result = conn.execute(stmt)
        if result.rowcount:
            return jsonify({"message": "Student record deleted successfully."}), 200
        return jsonify({"error": "Student not found."}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# New endpoint for masking student data
@app.route('/api/mask', methods=['POST'])
def mask_data():
    try:
        payload = request.get_json()
        data = payload.get("data", [])
        original_data = payload.get("originalData", data)  # fallback to data if originalData is not provided
        config = payload.get("config", {})

        masked_data = []
        for idx, record in enumerate(data):
            masked_record = record.copy()
            original_record = original_data[idx]
            for field, fieldConfig in config.items():
                rule = fieldConfig.get("maskingRule", "none").lower()

                # If the rule is "none", use the original value.
                if rule == "none":
                    masked_record[field] = original_record[field]
                    continue

                if rule == "partial":
                    if field in masked_record and isinstance(masked_record[field], str):
                        original_value = masked_record[field]
                        if len(original_value) > 3:
                            masked_record[field] = original_value[:3] + '*' * (len(original_value) - 3)
                elif rule == "generalized":
                    if field in masked_record:
                        masked_record[field] = '****'
                elif rule == "hash":
                    if field in masked_record:
                        value_to_hash = str(masked_record[field])  # Convert to string before hashing
                        hashed_value = hashlib.sha256(value_to_hash.encode()).hexdigest()[:8]
                        masked_record[field] = hashed_value.upper()
                elif rule == "faker":
                    if field in masked_record:
                        if field.lower() == "name":
                            masked_record[field] = fake.name()
                        elif field.lower() == "address":
                            masked_record[field] = fake.address().replace("\n", ", ")
                        elif field.lower() in ["phonenumber", "phone", "mobile"]:
                            masked_record[field] = fake.phone_number()
                        elif field.lower() == "year":
                            masked_record[field] = str(fake.random_int(min=1, max=4))
                        elif field.lower() == "gpa":
                            masked_record[field] = round(fake.random.uniform(0.0, 4.0), 2)
                        else:
                            masked_record[field] = fake.word()
            masked_data.append(masked_record)
        return jsonify(masked_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
