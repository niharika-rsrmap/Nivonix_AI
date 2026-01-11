import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
console.log('Uploads directory:', uploadsDir);

if (!fs.existsSync(uploadsDir)) {
    try {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log('Created uploads directory');
    } catch (err) {
        console.error('Failed to create uploads directory:', err);
    }
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const newFilename = uniqueSuffix + path.extname(file.originalname);
        cb(null, newFilename);
    }
});

const fileFilter = (req, file, cb) => {
    // Allow common file types
    const allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'text/csv',
        'application/json',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/zip'
    ];
    
    console.log('File:', file.originalname, 'MIME:', file.mimetype);
    
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: fileFilter
});

// Helper function to format file size
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Helper function to analyze file content
const analyzeFile = (filePath, mimetype, originalName) => {
    try {
        if (!fs.existsSync(filePath)) {
            console.error('File does not exist:', filePath);
            return {
                name: originalName,
                type: mimetype,
                sizeFormatted: '0 Bytes',
                error: 'File not found'
            };
        }

        const stats = fs.statSync(filePath);
        const analysis = {
            name: originalName,
            type: mimetype,
            size: stats.size,
            sizeFormatted: formatFileSize(stats.size),
            isImage: mimetype.startsWith('image/'),
            isDocument: mimetype.includes('pdf') || mimetype.includes('word') || mimetype.includes('document'),
            isArchive: mimetype.includes('zip') || mimetype.includes('rar'),
            isText: mimetype.startsWith('text/') || mimetype === 'application/json',
            extension: path.extname(originalName).toLowerCase()
        };

        // For text files, read content preview
        if (analysis.isText && stats.size < 1024 * 100) {
            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                analysis.preview = content.substring(0, 500);
                analysis.lines = content.split('\n').length;
            } catch (e) {
                console.error('Error reading file content:', e);
                analysis.preview = 'Could not read file content';
                analysis.lines = 0;
            }
        }

        return analysis;
    } catch (err) {
        console.error('File analysis error:', err);
        return {
            name: originalName,
            type: mimetype,
            sizeFormatted: '0 Bytes',
            error: 'Could not analyze file'
        };
    }
};

// Upload endpoint
router.post('/upload', (req, res) => {
    console.log('=== Upload request received ===');
    
    // Use upload middleware
    upload.array('files', 10)(req, res, (err) => {
        try {
            if (err) {
                console.error('Multer error:', err);
                return res.status(400).json({ 
                    success: false,
                    error: 'Upload error: ' + err.message 
                });
            }

            console.log('Files received:', req.files?.length || 0);
            
            if (!req.files || req.files.length === 0) {
                console.log('No files uploaded');
                return res.status(400).json({ 
                    success: false,
                    error: 'No files uploaded' 
                });
            }

            const uploadedFiles = req.files.map(file => {
                console.log('Processing file:', file.originalname, 'Path:', file.path);
                const analysis = analyzeFile(file.path, file.mimetype, file.originalname);
                
                return {
                    filename: file.filename,
                    originalName: file.originalname,
                    size: file.size,
                    mimetype: file.mimetype,
                    url: `/uploads/${file.filename}`,
                    analysis: analysis
                };
            });

            console.log('Upload successful, total files:', uploadedFiles.length);

            // Return response
            if (uploadedFiles.length === 1) {
                return res.json({
                    success: true,
                    file: uploadedFiles[0]
                });
            } else {
                return res.json({
                    success: true,
                    files: uploadedFiles,
                    count: uploadedFiles.length
                });
            }
        } catch (err) {
            console.error('Upload handler error:', err);
            return res.status(500).json({ 
                success: false,
                error: 'File upload failed: ' + err.message 
            });
        }
    });
});

export default router;
