from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, Float
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os
import pymysql
from faker import Faker

# Load environment variables
load_dotenv()

# Database configuration
DB_USER = os.getenv('DB_USER', 'myuser')
DB_PASS = os.getenv('DB_PASS', 'mypassword')
DB_HOST = os.getenv('DB_HOST', 'db')  # Matches the service name in Docker Compose
DB_PORT = os.getenv('DB_PORT', '3306')
DB_NAME = os.getenv('DB_NAME', 'mydatabase')

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

fake = Faker()

def generate_student_record():
    return {
        'Name': fake.name(),
        'Year': fake.random_int(min=1, max=4),
        'GPA': round(fake.random.uniform(0.0, 4.0), 2),  # GPA between 0.0 and 4.0
        'PhoneNumber': fake.phone_number()[:15],
        'Address': fake.address()
    }

def seed_students_database(num_students=100):
    """
    Seeds the students table with random fake data.
    """
    try:
        engine = create_engine(DATABASE_URL)
        metadata = MetaData()
        students_table = Table('students', metadata,
            Column('StudentID', Integer, primary_key=True, autoincrement=True),
            Column('Name', String(100), nullable=False),
            Column('Year', Integer, nullable=False),
            Column('GPA', Float, nullable=False),
            Column('PhoneNumber', String(15), nullable=False),
            Column('Address', String(255), nullable=False)
        )
        metadata.create_all(engine)  # Ensure the table exists

        Session = sessionmaker(bind=engine)
        with Session() as session:
            for _ in range(num_students):
                student_data = generate_student_record()
                insert_stmt = students_table.insert().values(**student_data)
                session.execute(insert_stmt)
            session.commit()
        return f"{num_students} student records created successfully."
    except Exception as e:
        return f"Error seeding data: {e}"

if __name__ == '__main__':
    num = int(os.environ.get('NUM_STUDENTS_TO_SEED', 100))
    result = seed_students_database(num)
    print(result)