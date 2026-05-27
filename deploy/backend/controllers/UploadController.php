<?php
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/jwt.php';

class UploadController {
    private string $uploadDir;
    private array  $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    private int    $maxSize      = 5 * 1024 * 1024; // 5MB

    public function __construct() {
        // Dynamically resolve uploads directory (local vs production)
        if (is_dir(__DIR__ . '/../../frontend/public')) {
            $this->uploadDir = __DIR__ . '/../../frontend/public/uploads/';
        } else {
            $this->uploadDir = __DIR__ . '/../../uploads/';
        }

        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }

    public function upload(): void {
        if (empty($_FILES['file'])) respondError('No file uploaded.');

        $file = $_FILES['file'];

        if ($file['error'] !== UPLOAD_ERR_OK) respondError('File upload error.');
        if ($file['size'] > $this->maxSize) respondError('File too large. Max 5MB allowed.');

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mimeType, $this->allowedTypes))
            respondError('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');

        $ext      = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid('img_', true) . '.' . $ext;
        $destPath = $this->uploadDir . $filename;

        if (!move_uploaded_file($file['tmp_name'], $destPath))
            respondError('Failed to save the uploaded file.', 500);

        respondSuccess([
            'filename' => $filename,
            'url'      => '/uploads/' . $filename,
        ], 201, 'File uploaded successfully.');
    }
}
