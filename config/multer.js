const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: ((req, file, cb) => {
        const folderName = file.fieldname;
        cb(null, path.join(__dirname, '../public/images/', `${folderName}s`))
    }),
    filename: ((req, file, cb) => {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    })
});

const upload = multer({ 
    storage: storage,
    imageLimit: 3,
 
    // fileFilter: (req, file, cb) => {
        
    //     const fileExtension = file.extname.toLowerCase();
    //     const allowedExtensions = ['.jpg','.jpeg', '.png', '.gif','.svg','.avif','.webp'];

    //     if (!allowedExtensions.includes(fileExtension)) {
    //         cb(false, 'Invalid file extension');
    //         return;
    //     }

    //     cb(true);
    // }
});

module.exports = upload