import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { maxsize } from "../constants";
import { returnFileExtension, checkFileType } from "../utils/checkFileType";
import { v4 } from "uuid";

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'temp/');
    },
    filename: function(req, file, cb){
        const ext = returnFileExtension(file);
        const name = v4();
        cb(null, v4() + ext)
    }
})

const upload = multer({
    limits: {fileSize: maxsize},
    storage: storage,
    fileFilter: function(req, file, cb){
        checkFileType(file, cb);
    }
});

export const uploadMiddleware: (req: Request, res: Response, next: NextFunction) => void = function(req: Request, res: Response, next: NextFunction): void {
    if (!req.session.userId){
        return res.end('not logged in');
    }
    const uploadSingle = upload.single('image');
    uploadSingle(req, res, (err: any) => {
        if (err){
            if(err.code === 'LIMIT_FILE_SIZE'){
                return res.end('file too large');
            }
        }
        next();
    })
}