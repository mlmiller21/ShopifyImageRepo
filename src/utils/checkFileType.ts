
//simple validation
export const checkFileType: (file: Express.Multer.File, cb: Function) => any = function(file: Express.Multer.File, cb: Function): any {
    //check mime
    const mimeTypes = /image\/jpeg|image\/jpg|image\/png/;
    if (!mimeTypes.test(file.mimetype)){
        cb(null, false);
    }
    cb(null, true);
}

export const returnFileExtension: (file: Express.Multer.File) => string = function(file: Express.Multer.File): string {
    const mimeTypes = /image\/jpeg|image\/jpg|image\/png/;
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