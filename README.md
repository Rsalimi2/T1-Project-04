# Flask API with Swagger Documentation

## Setup Instructions

### 1. Clone and Configure Environment Variables
Copy the example environment file and rename it:
```sh
cp .env.example .env
```
Modify `.env` with your database credentials as needed.

### 2. Install Dependencies
Ensure you have Python installed, then install the required dependencies:
```sh
pip install -r requirements.txt
```

### 3. Start the Database Server
Run the following command to start the MySQL database server using Docker:
```sh
docker-compose up -d
```

### 4. Start the Flask Application
In a new shell, navigate to the project root and run:
```sh
python backend/app.py
```

### 5. Access the API Documentation
Once the server is running, open your browser and go to:
[Swagger API Docs](http://localhost:5000/apidocs/#/)

### 6. Verify Server Status
The Flask server should be running on:
[http://127.0.0.1:5000](http://127.0.0.1:5000)

You can now make API requests and explore the available endpoints!

### 7. Start Frontend
in a new terminal window download and install froneend dependecies
```
cd frontend
npm install
```
start the react app
```
npm start
```

access react app via http://localhost:3000/

login:
`testuser`
`password`
