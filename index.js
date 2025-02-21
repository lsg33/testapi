const express = require('express');
const multer = require('multer');
const vision = require('@google-cloud/vision');
const path = require('path');
const fs = require('fs');

// Create a client with your Google Vision credentials
const client = new vision.ImageAnnotatorClient({
  keyFilename: path.join(__dirname, 'monkey.json') // Path to your local API key
});

const app = express();
const upload = multer({ dest: 'uploads/' }); // Save uploaded images to 'uploads' folder

// Serve the HTML form when visiting the root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); // Serve the HTML form
});

// Handle image upload and Google Vision API call
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const filePath = req.file.path; // Path to the uploaded image

    // Call Google Vision API for text detection (OCR)
    const [result] = await client.textDetection(filePath);
    const detections = result.textAnnotations;

    // Clean up the uploaded image file
    fs.unlinkSync(filePath); // Remove the temporary file

    // Respond with the detected text as JSON
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
