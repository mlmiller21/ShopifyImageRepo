import { imageExRe } from "../regex";

//simple validation
export const checkFileType: (file: Express.Multer.File, cb: Function) => any = function(file: Express.Multer.File, cb: Function): any {
    //check mime
    if (!imageExRe.test(file.mimetype)){
        cb(null, false);
    }
    cb(null, true);
}

export const returnFileExtension: (file: Express.Multer.File) => string = function(file: Express.Multer.File): string {
    if (file.mimetype === 'image/jpeg'){
        return '.jpeg';
    }
    if (file.mimetype === 'image/jpg'){
        return '.jpg';
    }
    if (file.mimetype === 'image/png'){
        return '.png';
    }
    throw new Error('file type not supported');
}