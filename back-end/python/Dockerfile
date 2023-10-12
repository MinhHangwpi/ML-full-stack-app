# FlaskApp/Dockerfile

# Use official Python image
FROM python:3.8-slim

# Set working directory
WORKDIR /app

# Install required packages
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app
COPY . .

# Expose port
EXPOSE 5000

# Command to run the app
CMD ["python", "flask_server.py"]
