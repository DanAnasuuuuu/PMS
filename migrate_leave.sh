#!/bin/bash
# Script to create and apply Leave model migrations

echo "=== Creating Leave Model Migrations ==="
echo ""

# Step 1: Create migrations
echo "Step 1: Creating migrations..."
sudo docker-compose exec web python manage.py makemigrations personnel
echo ""

# Step 2: Apply migrations
echo "Step 2: Applying migrations..."
sudo docker-compose exec web python manage.py migrate
echo ""

# Step 3: Restart web container
echo "Step 3: Restarting web container..."
sudo docker-compose restart web
echo ""

echo "=== Migration Complete! ==="
echo "Leave management backend is now ready."
echo "API endpoints available at:"
echo "  - GET/POST  /api/leaves/"
echo "  - POST      /api/leaves/{id}/approve/"
echo "  - POST      /api/leaves/{id}/reject/"
echo "  - POST      /api/leaves/{id}/cancel/"
