FROM python:3.9-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc python3-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy project
COPY . /app/

# Create necessary directories
RUN mkdir -p /app/media /app/files/migrations

# Ensure migrations directory has __init__.py
RUN touch /app/files/migrations/__init__.py

# Set permissions for entrypoint script
RUN chmod +x /app/entrypoint.sh

# Run the application
EXPOSE 8000
CMD ["/app/entrypoint.sh"]