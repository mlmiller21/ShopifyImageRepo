import { Request, Response } from "express";
import { imageExRe, resolutionRe } from "../regex";
import { fieldError } from "../utils/fieldError";

import { Images } from "../entities/Images";

import fs from "fs";
import fileType from "file-type";
import sizeOf from 'image-size';

//Couldn't get tf to work, sad face
import tf from "@tensorflow/tfjs-node";
import mobileNet from "@tensorflow-models/mobilenet";

import { CallbackFunction } from "ioredis";
import { imageDimensions } from "../interfaces/imageDimensions";
import { ImageResponse } from "../interfaces/ImageReturn";
import { User } from "../entities/User";

export const uploadImage: (req: Request) => Promise<ImageResponse | null> = async function(req: Request): Promise<ImageResponse | null> {
    const stream = fs.createReadStream(req.file.path);
    //validate file once again this time checking magic numbers from stream
    //if magic numbers don't match, then delete it from temp
    const type = await fileType.fromStream(stream);
    
    //fs.unlink is being weird and the file handles aren't being released on error
    if (!imageExRe.test(type!.mime)){
        return new Promise((res, rej) => {
            fs.unlink(req.file.path, (err) => {
                if (err){
                    res({errors: [fieldError('file', 'file is not an image')]})
                }
                console.log("deleted");
                res(null);
            })
        })
    }

    //magic number have matched
    //get size of image (this should never fail as it's been verified that this is for sure an image)
    let size = await new Promise((res, rej) => {
        sizeOf(req.file.path, (err, dimensions) => {
            res(dimensions);
        })
    })

    //now store this within a new path associated to the user
    
    //First create the directory with the userid associated with the directory
    fs.mkdir(`repo/${req.session.userId}`, {recursive: true}, (err) => {
        if (err){
            console.log(err);
        }
    })

    //then get new file name 
    const fileName = req.file.path.split('\\')[1];
    const newPath = `repo\\${req.session.userId}\\${fileName}`
    await new Promise((res, rej) => {move(req.file.path, newPath, (err) => {
            res(console.log(err));
        })
    })      

    const {width, height} = size as imageDimensions;
    //Now store the file stuff
    
    const image = await Images.create({imageid: fileName, extension: type!.ext, userid: req.session.userId, width: width, height: height}).save();

    //NOW use a tensor flow model to obtain the tags for the image to search by

   /*  const imageBuffer: Buffer = await new Promise((res, rej) => {fs.readFile(newPath, (err, data) => {
        err? rej(err) : res(data);
        })
    });

    console.log(imageBuffer);
    
    const decodedImage = tf;
    console.log(decodedImage);

    const model = await mobileNet.load();
    const predictions = await model.classify(decodedImage); */

    return null;

}

export const getImages: (req: Request) => Promise<ImageResponse> = async function(req: Request): Promise<ImageResponse> {
    if (!req.session.userId){
        return {errors: [fieldError('session', 'invalid session')]}
    }
    //just assume a user is always returned here
    const user = await User.findOne({id: req.session.userId}, {relations: ["images"]});
    const imageReturn = user!.images.map(image => image.imageid);

    console.log(imageReturn);
    
    return {images: imageReturn}
}

export const searchImages: (req: Request, search: string) => Promise<ImageResponse | null> = async function(req: Request, search: string): Promise<ImageResponse | null> {
    if (!req.session.userId){
        return {errors: [fieldError('session', 'invalid session')]}
    }
    let user;
    try{
        user = await User.findOne({id: req.session.userId}, {relations: ["images", "images.tags"]});
    }
    catch(err){
        return {errors: [fieldError('user', 'user does not exist')]}
    }

    let images;
    //searching by resolution
    if (resolutionRe.test(search)){
        let dimensions = search.toLowerCase().split('x');
        let width = parseInt(dimensions[0]);
        let height = parseInt(dimensions[2]);
        images = user!.images.filter(image => {
            image.width === width && image.height === height
        })
    }
    //searching by tag
    else {
        images = user!.images.filter(image => image.tags.some(tag => tag.tag.includes(search)));
    }

    //user: {image: {tag: []}}
    //First filter to find all images which contain the search string in their tag
    //Then get the image url of each image
    const imageReturn = images.map(image => image.imageid);

    return {images: imageReturn}
}

export const deleteImage: (imageid: string, req: Request) => Promise<ImageResponse | null> = async function(imageid: string, req: Request): Promise<ImageResponse | null> {
    if (!req.session.userId){
        return {errors: [fieldError('session', 'invalid session')]}
    }
    try{
        await Images.delete({imageid: imageid});
    }
    catch(err){
        if (err){
            return {errors: [fieldError('image', 'image does not exist')]}
        }
    }
    return null;
}

//move file from one directory to another
const move: (oldPath: string, newPath: string, callback: CallbackFunction) => void = function(oldPath: string, newPath: string, callback: CallbackFunction) {

    fs.rename(oldPath, newPath, function (err) {
        if (err) {
            if (err.code === 'EXDEV') {
                copy();
            } else {
                callback(err);
            }
            return;
        }
        callback();
    });

    function copy() {
        var readStream = fs.createReadStream(oldPath);
        var writeStream = fs.createWriteStream(newPath);

        readStream.on('error', callback);
        writeStream.on('error', callback);

        readStream.on('close', function () {
            fs.unlink(oldPath, callback);
        });

        readStream.pipe(writeStream);
    }
}