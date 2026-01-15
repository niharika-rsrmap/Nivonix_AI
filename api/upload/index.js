export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      return res.status(400).json({
        success: false,
        error: 'File uploads are not supported on serverless functions. Use Cloudinary or AWS S3 instead.'
      });
    } catch (err) {
      console.error('Upload error:', err);
      return res.status(500).json({
        success: false,
        error: 'Upload failed: ' + err.message
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
