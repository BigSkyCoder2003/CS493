#!/bin/sh

#Fake Data Generated With Github Copilot

status() {
    printf "\n=====================================================\n"
    printf "%s\n" "$1"
    printf -- "-----------------------------------------------------\n"
}

# --- BUSINESSES ---

status 'POST /businesses - Valid Input'
curl -X POST -H "Content-Type: application/json" -d '{
  "business_name": "Test Business",
  "street_address": "123 Test St",
  "city": "Test City",
  "state": "TS",
  "zip": 12345,
  "phone_number": "123-456-7890",
  "category": "Restaurant",
  "subcategory": "Pizza"
}' http://localhost:8080/businesses

status 'POST /businesses - Missing Required Fields'
curl -X POST -H "Content-Type: application/json" -d '{
  "business_name": "Test Business"
}' http://localhost:8080/businesses

status 'PATCH /businesses/:name - Valid Input'
curl -X PATCH -H "Content-Type: application/json" -d '{
  "street_address": "456 Updated St"
}' http://localhost:8080/businesses/Test%20Business

status 'PATCH /businesses/:name - Invalid Name'
curl -X PATCH -H "Content-Type: application/json" -d '{
  "street_address": "456 Updated St"
}' http://localhost:8080/businesses/InvalidName

status 'DELETE /businesses/:name - Valid Name'
curl -X DELETE http://localhost:8080/businesses/Test%20Business

status 'DELETE /businesses/:name - Invalid Name'
curl -X DELETE http://localhost:8080/businesses/InvalidName

status 'GET /businesses - Fetch All Businesses'
curl http://localhost:8080/businesses

status 'GET /businesses/:name - Valid Name'
curl http://localhost:8080/businesses/Test%20Business

status 'GET /businesses/:name - Invalid Name'
curl http://localhost:8080/businesses/InvalidName

# --- REVIEWS ---

status 'POST /reviews - Valid Input'
curl -X POST -H "Content-Type: application/json" -d '{
  "business_name": "Test Business",
  "star": 5,
  "dollar_sign_rating": 3,
  "review": "Great place!"
}' http://localhost:8080/reviews

status 'POST /reviews - Missing Required Fields'
curl -X POST -H "Content-Type: application/json" -d '{
  "business_name": "Test Business"
}' http://localhost:8080/reviews

status 'PATCH /reviews/:review_id - Valid Input'
curl -X PATCH -H "Content-Type: application/json" -d '{
  "star": 4
}' http://localhost:8080/reviews/1

status 'PATCH /reviews/:review_id - Invalid ID'
curl -X PATCH -H "Content-Type: application/json" -d '{
  "star": 4
}' http://localhost:8080/reviews/9999

status 'DELETE /reviews/:review_id - Valid ID'
curl -X DELETE http://localhost:8080/reviews/1

status 'DELETE /reviews/:review_id - Invalid ID'
curl -X DELETE http://localhost:8080/reviews/9999

status 'GET /reviews - Fetch All Reviews'
curl http://localhost:8080/reviews

# --- PHOTOS ---

status 'POST /photos - Valid Input'
curl -X POST -H "Content-Type: application/json" -d '{
  "business_name": "Test Business",
  "photo_file": "test_photo.jpg",
  "caption": "A great photo!"
}' http://localhost:8080/photos

status 'POST /photos - Missing Required Fields'
curl -X POST -H "Content-Type: application/json" -d '{
  "business_name": "Test Business"
}' http://localhost:8080/photos

status 'PATCH /photos/:photo_id - Valid Input'
curl -X PATCH -H "Content-Type: application/json" -d '{
  "caption": "Updated caption"
}' http://localhost:8080/photos/1

status 'PATCH /photos/:photo_id - Invalid ID'
curl -X PATCH -H "Content-Type: application/json" -d '{
  "caption": "Updated caption"
}' http://localhost:8080/photos/9999

status 'DELETE /photos/:photo_id - Valid ID'
curl -X DELETE http://localhost:8080/photos/1

status 'DELETE /photos/:photo_id - Invalid ID'
curl -X DELETE http://localhost:8080/photos/9999

status 'GET /photos - Fetch All Photos'
curl http://localhost:8080/photos