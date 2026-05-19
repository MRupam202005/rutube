import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {  // cb => call back function 
        cb(null, "./public/temp")   // this is the path where the file will be stored
    },  
    filename: function (req, file, cb) {    // this is the name of the file which will be stored
        cb(null, file.originalname)     // using the original name of the file
    }
})

export const upload = multer({ storage })
