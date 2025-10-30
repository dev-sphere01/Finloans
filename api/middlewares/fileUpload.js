const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Create application-specific folder or temp folder for pre-upload
        const applicationId = req.body.applicationId || req.params.applicationId || 'temp';
        const appDir = path.join(uploadsDir, applicationId);
        
        if (!fs.existsSync(appDir)) {
            fs.mkdirSync(appDir, { recursive: true });
        }
        
        cb(null, appDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const documentType = req.body.documentType || file.fieldname;
        const name = documentType.replace(/\s+/g, '_') + '-' + uniqueSuffix + ext;
        cb(null, name);
    }
});

// File filter for allowed types
const fileFilter = (req, file, cb) => {
    // Allowed file types for documents
    const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, images, and Word documents are allowed.'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 20 // Maximum 20 files per request
    },
    fileFilter: fileFilter
});

// Middleware for handling multiple document uploads
const uploadDocuments = upload.array('documents', 20);

// Middleware for handling single document upload during application process
const uploadSingleDocument = upload.single('document');

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 5MB per file.'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Maximum 20 files allowed.'
            });
        }
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    
    if (error.message.includes('Invalid file type')) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    
    next(error);
};

module.exports = {
    uploadDocuments,
    uploadSingleDocument,
    handleUploadError
};