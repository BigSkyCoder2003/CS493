#!/bin/bash

cd "$(dirname "$0")"

echo "Setting up Newman tests..."

# Check if newman is installed
if ! command -v newman &> /dev/null; then
    echo "Newman is not installed. Installing Newman globally..."
    npm install -g newman
fi

# Create a simple test image if it doesn't exist
if [ ! -f "test.jpg" ]; then
    echo "Creating test image..."
    # Create a simple 1x1 pixel JPEG using ImageMagick (if available)
    if command -v convert &> /dev/null; then
        convert -size 1x1 xc:red test.jpg
    elif command -v magick &> /dev/null; then
        magick -size 1x1 xc:red test.jpg
    else
        # Create a minimal JPEG file using base64 encoding
        echo "Creating minimal test JPEG..."
        base64 -d << 'EOF' > test.jpg
/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/AB8AAQAB/9k=
EOF
    fi
fi

echo "Waiting for API to be ready..."
sleep 5

# Check if API is responding
API_READY=false
for i in {1..30}; do
    if curl -s http://localhost:8000/businesses > /dev/null 2>&1; then
        API_READY=true
        break
    fi
    echo "Waiting for API... ($i/30)"
    sleep 2
done

if [ "$API_READY" = false ]; then
    echo "API is not responding at http://localhost:8000"
    echo "Please make sure your API server is running"
    exit 1
fi

echo "API is ready. Running Newman tests..."

# Run the Newman collection
newman run api-tests.postman_collection.json \
    --timeout-request 30000 \
    --bail \
    --color on \
    --reporters cli,json \
    --reporter-json-export newman-report.json

echo "Tests completed. Check newman-report.json for detailed results."

# Extract photo info from Newman results and download the photo
echo ""
echo "Downloading test photo for verification..."

# Get the photo ID from the Newman report
if [ -f "newman-report.json" ]; then
    PHOTO_ID=$(jq -r '.run.executions[] | select(.item.name == "Upload Valid JPEG Photo") | .response.body' newman-report.json 2>/dev/null | jq -r '.id' 2>/dev/null)
    
    if [ "$PHOTO_ID" != "null" ] && [ "$PHOTO_ID" != "" ]; then
        echo "Found photo ID: $PHOTO_ID"
        
        # Download the photo
        DOWNLOAD_URL="http://localhost:8000/media/photos/${PHOTO_ID}.jpg"
        OUTPUT_FILE="newman-downloaded-${PHOTO_ID}.jpg"
        
        echo "Downloading from: $DOWNLOAD_URL"
        curl -s "$DOWNLOAD_URL" -o "$OUTPUT_FILE"
        
        if [ -f "$OUTPUT_FILE" ]; then
            FILE_SIZE=$(stat -c%s "$OUTPUT_FILE" 2>/dev/null || stat -f%z "$OUTPUT_FILE" 2>/dev/null || echo "0")
            if [ "$FILE_SIZE" -gt 0 ]; then
                echo "✓ Photo downloaded successfully: $OUTPUT_FILE ($FILE_SIZE bytes)"
            else
                echo "✗ Photo file is empty: $OUTPUT_FILE"
            fi
        else
            echo "✗ Failed to download photo"
        fi
    else
        echo "Could not extract photo ID from Newman results"
    fi
else
    echo "Newman report not found, skipping photo download"
fi 