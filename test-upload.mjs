import fs from 'fs';

const imagePath = 'c:\\Users\\HP\\Desktop\\propertyla\\propertyla_fe\\public\\assets\\img\\hero\\hero-bg-1.jpg';

async function testUpload() {
  try {
    const fileData = fs.readFileSync(imagePath);
    const blob = new Blob([fileData], { type: 'image/jpeg' });

    const formData = new FormData();
    formData.append('files', blob, 'hero-bg-1.jpg');

    console.log('Sending upload request to http://localhost:3008/api/uploads ...');
    const response = await fetch('http://localhost:3008/api/uploads', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    console.log('Upload response status:', response.status);
    console.log('Upload response body:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Upload failed:', error.message);
  }
}

testUpload();
