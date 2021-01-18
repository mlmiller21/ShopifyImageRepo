import { UserResponse } from "../interfaces/UserResponse";
import { Request, Response } from "express";
import { imageExRe } from "../regex";
import { fieldError } from "../utils/fieldError";

import { Images } from "../entities/Images";

import fs from "fs";
import fileType from "file-type";
import sizeOf from 'image-size';


import tf from "@tensorflow/tfjs-node";
import mobileNet from "@tensorflow-models/mobilenet";

import { CallbackFunction } from "ioredis";
import { imageDimensions } from "../interfaces/imageDimensions";

export const uploadImage: (req: Request) => Promise<UserResponse | null> = async function(req: Request): Promise<UserResponse | null> {
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
    move(req.file.path, newPath, (err) => {
        console.log(err);
    })

    const {width, height} = size as imageDimensions;
    //Now store the file stuff
    await Images.create({imageid: fileName, extension: type!.ext, userid: req.session.userId, width: width, height: height}).save();

    //NOW use a tensor flow model to obtain the tags for the image to search by

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