# API Testing with Newman

This directory contains a comprehensive test suite for the Business Photo API using Newman (Postman's command-line test runner).

## Prerequisites

1. **Node.js and npm**: Required to install Newman
2. **Running API**: Make sure your API server is running on `http://localhost:8000`
3. **Database with data**: Ensure your database is initialized with some business data

## Quick Start

### Option 1: Use the provided script (Recommended)
```bash
cd tests
./run-newman-tests.sh
```

This script will:
- Check if Newman is installed (and install it if needed)
- Create a test image file if it doesn't exist
- Wait for the API to be ready
- Run all tests
- Generate a detailed report

### Option 2: Manual Newman installation and execution

1. Install Newman globally:
```bash
npm install -g newman
```

2. Create a test image file (or copy one):
```bash
# Create a simple test image (requires ImageMagick)
convert -size 100x100 xc:red test.jpg

# Or use any JPEG file you have
cp /path/to/your/image.jpg test.jpg
```

3. Run the tests:
```bash
newman run api-tests.postman_collection.json
```

## Test Collection Overview

The test collection is organized into the following categories:

### 1. Setup Tests
- **Get First Business ID**: Retrieves a business ID to use in subsequent tests

### 2. Photo Upload Tests
- **Upload Valid JPEG Photo**: Tests successful photo upload
- **Upload Without File**: Tests error handling when no file is provided
- **Upload With Invalid Business ID**: Tests error handling with invalid business ID

### 3. Photo Retrieval Tests
- **Get Photo Details**: Tests retrieving photo metadata

### 4. Business Integration Tests
- **Check Business Contains Photo**: Verifies photo is linked to business

### 5. Photo Download Tests
- **Download Photo via Media Path**: Tests photo download functionality

## Configuration

The collection uses these variables (configurable in the collection):
- `baseUrl`: API base URL (default: `http://localhost:8000`)
- `businessId`: Automatically set from the first business in the database
- `photoId`: Automatically set from successful photo upload
- `photoPath`: Automatically set from photo details response

## Test File Requirements

- The tests expect a `test.jpg` file in the same directory
- The provided script will create one automatically if it doesn't exist
- You can replace it with any valid JPEG or PNG file

## Running with Different Options

### Run with custom base URL:
```bash
newman run api-tests.postman_collection.json --env-var "baseUrl=http://localhost:3000"
```

### Run with detailed output:
```bash
newman run api-tests.postman_collection.json --reporters cli,htmlextra --reporter-htmlextra-export report.html
```

### Run specific folder only:
```bash
newman run api-tests.postman_collection.json --folder "Photo Upload Tests"
```

## Expected Test Results

When all tests pass, you should see:
- ✓ Status codes match expected values
- ✓ Response data contains required fields
- ✓ Photo upload creates valid links
- ✓ Business contains the uploaded photo
- ✓ Photo download works correctly

## Troubleshooting

### API not responding
- Make sure your API server is running: `npm start` or `docker-compose up`
- Check if the database is initialized: `npm run initdb`
- Verify the baseUrl in the collection matches your server

### Newman not found
- Install Newman globally: `npm install -g newman`
- Or use npx: `npx newman run api-tests.postman_collection.json`

### Test image issues
- Make sure `test.jpg` exists in the tests directory
- File should be a valid JPEG or PNG image
- File size should be under 5MB (API limit)

### Tests failing
- Check the detailed error messages in the Newman output
- Verify your API endpoints match the expected behavior
- Check the newman-report.json file for detailed results

## Integration with CI/CD

This test collection can be easily integrated into CI/CD pipelines:

```bash
# Example GitHub Actions step
- name: Run API Tests
  run: |
    cd tests
    newman run api-tests.postman_collection.json --reporters cli,junit --reporter-junit-export results.xml
``` 