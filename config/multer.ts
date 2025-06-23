import multer from 'multer';
import { AppError } from '../src/error/AppError.ts';

const storage = multer.memoryStorage();

const pdfFileFilter = (req: any, file: any, cb: any) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new AppError('Formato de arquivo não suportado. Envie apenas PDFs.', 400), false);
    }
};

const imageFileFilter = (req: any, file: any, cb: any) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
        cb(null, true);
    } else {
        cb(new AppError('Formato de imagem não suportado (apenas jpeg, png, gif).', 400), false);
    }
};

// Exportação para upload de PDF (renomeado para clareza)
export const pdfUpload = multer({ 
    storage: storage,
    fileFilter: pdfFileFilter,
    limits: { fileSize: 1024 * 1024 * 10 } // 10MB
});

// NOVA EXPORTAÇÃO para upload de Imagem
export const imageUpload = multer({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // 5MB para imagens
});