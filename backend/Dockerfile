FROM python:3.9-slim

WORKDIR /app

# Install system dependencies required for some Python packages
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    git \
    libmupdf-dev \
    libpoppler-cpp-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy dependencies
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
# Note: Only copy the app directory since that's where our code is
COPY app /app/app

# Create necessary directories
RUN mkdir -p /app/data/uploads

# Expose FastAPI port
EXPOSE 8000

# Update the uvicorn command to use the correct module path
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]