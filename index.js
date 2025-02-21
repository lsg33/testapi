const express = require('express');
const multer = require('multer');
const vision = require('@google-cloud/vision');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // Import CORS

// Initialize the Vision client with credentials from environment variable
const client = new vision.ImageAnnotatorClient({
  keyFilename: path.join(__dirname, 'astral-depth-450819-a7-d1ed844dbe30.json') // Path to your local API key
});

const app = express();
const upload = multer({ dest: 'uploads/' });

// Use CORS middleware to allow requests from any origin
app.use(cors()); // This will allow all domains to make requests to your server

// Serve the HTML form when visiting the root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle image upload and Vision API call
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const filePath = req.file.path; // Path to uploaded image

    // Call Vision API for text detection
    const [result] = await client.textDetection(filePath);
    const detections = result.textAnnotations;

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    // Return detected text as JSON
    res.json({ text: detections.map(text => text.description).join('\n') });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while processing the image.' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
