#!/bin/sh

# Ensure the script stops on errors
set -e

# Wait for a moment to make sure the database is ready
echo "Waiting for database to be ready..."
sleep 2

# Print current directory and files for debugging
echo "Current directory: $(pwd)"
echo "Files in migrations directory:"
ls -la files/migrations/

# Delete the database file to start fresh
echo "Removing old database..."
rm -f db.sqlite3

# Remove any existing migrations
echo "Cleaning up migrations..."
rm -rf files/migrations/0*.py
touch files/migrations/__init__.py

# Create fresh migrations
echo "Creating migrations..."
python manage.py makemigrations
python manage.py makemigrations files

# Show the planned migrations
echo "Migration plan:"
python manage.py showmigrations

# Apply migrations
echo "Applying migrations..."
python manage.py migrate --noinput

# Create a superuser for admin access if needed
# python manage.py createsuperuser --noinput

# Start Django development server
echo "Starting server..."
python manage.py runserver 0.0.0.0:8000