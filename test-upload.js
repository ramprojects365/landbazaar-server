const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

// Create a simple test image buffer (1x1 pixel PNG)
const testImageBuffer = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
  0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
  0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
  0x54, 0x08, 0x99, 0x01, 0x01, 0x01, 0x00, 0x00,
  0xFE, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01,
  0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
  0xAE, 0x42, 0x60, 0x82
]);

async function testUpload() {
  try {
    console.log('Testing upload to http://localhost:3008/api/uploads...');
    
    const formData = new FormData();
    formData.append('files', testImageBuffer, {
      filename: 'test.png',
      contentType: 'image/png'
    });

    const response = await axios.post('http://localhost:3008/api/uploads', formData, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImI3ZDZmOGUzLTkwZDYtNDIwNS1hN2IzLWEwNzQ5MjFhNjI1ZCIsInVzZXJuYW1lIjoibGVlbGFwcmFzYW50aGkiLCJlbWFpbCI6ImxlZWxhcHJhc2FudGhpQGdtYWlsLmNvbSIsInBob25lTnVtYmVyIjpudWxsLCJlbWFpbFZlcmlmaWVkIjp0cnVlLCJjcmVhdGVkQXQiOiIyMDI2LTAyLTIwVDAzOjA1OjQwLjI0NVoiLCJ1cGRhdGVkQXQiOiIyMDI2LTAzLTA0VDEyOjE2OjQxLjEyMFoifQ.I5q9L8xJ3Q7wYkZQJ8h2mKJ9zX7L8pN3mQ2fR0',
        ...formData.getHeaders()
      }
    });

    console.log('Upload response:', response.data);
  } catch (error) {
    console.error('Upload error:', error.response?.data || error.message);
  }
}

testUpload();
