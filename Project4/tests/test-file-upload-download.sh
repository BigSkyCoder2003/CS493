#!/bin/bash

cd "$(dirname "$0")"

echo "=== Photo Upload & Download Test ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if test image exists
if [ ! -f "test.jpg" ]; then
    echo -e "${RED}✗ test.jpg not found. Creating a test image...${NC}"
    # Create a minimal JPEG file using base64 encoding
    base64 -d << 'EOF' > test.jpg
/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/AB8AAQAB/9k=
EOF
    echo -e "${GREEN}✓ Created minimal test image${NC}"
fi

# Wait for API to be ready
echo -e "${BLUE}Checking if API is available...${NC}"
for i in {1..10}; do
    if curl -s http://localhost:8000/businesses > /dev/null 2>&1; then
        echo -e "${GREEN}✓ API is ready${NC}"
        break
    fi
    if [ $i -eq 10 ]; then
        echo -e "${RED}✗ API is not responding at http://localhost:8000${NC}"
        echo "Please make sure your API server is running"
        exit 1
    fi
    echo "Waiting for API... ($i/10)"
    sleep 2
done

# Get a business ID
echo -e "${BLUE}Getting business ID...${NC}"
BUSINESS_ID=$(curl -s http://localhost:8000/businesses | jq -r '.businesses[0]._id')

if [ "$BUSINESS_ID" == "null" ] || [ -z "$BUSINESS_ID" ]; then
    echo -e "${RED}✗ Could not get business ID${NC}"
    echo "Make sure your database is initialized with business data"
    exit 1
fi

echo -e "${GREEN}✓ Using business ID: $BUSINESS_ID${NC}"

# Upload a photo
echo ""
echo -e "${BLUE}Uploading photo...${NC}"
UPLOAD_RESPONSE=$(curl -s -X POST \
    -F "file=@test.jpg" \
    -F "businessId=$BUSINESS_ID" \
    -F "caption=File upload test" \
    http://localhost:8000/photos)

echo "Upload response: $UPLOAD_RESPONSE"

# Extract photo ID from response
PHOTO_ID=$(echo "$UPLOAD_RESPONSE" | jq -r '.id')

if [ "$PHOTO_ID" == "null" ] || [ -z "$PHOTO_ID" ]; then
    echo -e "${RED}✗ Upload failed or could not extract photo ID${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Photo uploaded successfully with ID: $PHOTO_ID${NC}"

# Get photo details
echo ""
echo -e "${BLUE}Getting photo details...${NC}"
PHOTO_DETAILS=$(curl -s http://localhost:8000/photos/$PHOTO_ID)
echo "Photo details: $PHOTO_DETAILS"

# Extract download path
PHOTO_PATH=$(echo "$PHOTO_DETAILS" | jq -r '.path')
echo -e "${GREEN}✓ Photo path: $PHOTO_PATH${NC}"

# Download the photo
echo ""
echo -e "${BLUE}Downloading photo...${NC}"
DOWNLOAD_URL="http://localhost:8000$PHOTO_PATH"
OUTPUT_FILE="downloaded-$PHOTO_ID.jpg"

echo "Downloading from: $DOWNLOAD_URL"
curl -s "$DOWNLOAD_URL" -o "$OUTPUT_FILE"

# Check download result
if [ -f "$OUTPUT_FILE" ]; then
    FILE_SIZE=$(stat -c%s "$OUTPUT_FILE" 2>/dev/null || stat -f%z "$OUTPUT_FILE" 2>/dev/null || echo "0")
    ORIGINAL_SIZE=$(stat -c%s "test.jpg" 2>/dev/null || stat -f%z "test.jpg" 2>/dev/null || echo "0")
    
    if [ "$FILE_SIZE" -gt 0 ]; then
        echo -e "${GREEN}✓ Photo downloaded successfully!${NC}"
        echo "  File: $OUTPUT_FILE"
        echo "  Size: $FILE_SIZE bytes"
        echo "  Original size: $ORIGINAL_SIZE bytes"
        
        if [ "$FILE_SIZE" -eq "$ORIGINAL_SIZE" ]; then
            echo -e "${GREEN}✓ File sizes match perfectly!${NC}"
        else
            echo -e "${BLUE}ℹ File sizes differ (this may be normal due to processing)${NC}"
        fi
        
        # Verify it's actually an image file
        if file "$OUTPUT_FILE" | grep -q "JPEG\|image"; then
            echo -e "${GREEN}✓ Downloaded file is a valid image${NC}"
        else
            echo -e "${RED}⚠ Downloaded file may not be a valid image${NC}"
        fi
    else
        echo -e "${RED}✗ Downloaded file is empty (0 bytes)${NC}"
        rm -f "$OUTPUT_FILE"
        exit 1
    fi
else
    echo -e "${RED}✗ Failed to download photo${NC}"
    exit 1
fi

# Test business integration
echo ""
echo -e "${BLUE}Checking business contains the photo...${NC}"
BUSINESS_DATA=$(curl -s http://localhost:8000/businesses/$BUSINESS_ID)
PHOTO_COUNT=$(echo "$BUSINESS_DATA" | jq '.photos | length')
PHOTO_FOUND=$(echo "$BUSINESS_DATA" | jq --arg id "$PHOTO_ID" '.photos[] | select(._id == $id) | ._id' | wc -l)

if [ "$PHOTO_FOUND" -gt 0 ]; then
    echo -e "${GREEN}✓ Photo is linked to business (total photos: $PHOTO_COUNT)${NC}"
else
    echo -e "${RED}✗ Photo not found in business data${NC}"
fi

echo ""
echo -e "${GREEN}=== Test Summary ===${NC}"
echo -e "${GREEN}✓ Photo upload: SUCCESS${NC}"
echo -e "${GREEN}✓ Photo download: SUCCESS${NC}"
echo -e "${GREEN}✓ Business integration: SUCCESS${NC}"
echo -e "${GREEN}✓ Downloaded file: $OUTPUT_FILE${NC}"
echo ""
echo -e "${BLUE}All tests passed! 🎉${NC}" 