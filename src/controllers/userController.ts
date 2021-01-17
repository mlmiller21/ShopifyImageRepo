import { User } from "../entities/User";
import { ForgotPassword } from "../entities/ForgotPassword";
import { createPassword, comparePassword } from "../utils/password";
import { validateRegister } from "../utils/validateRegister";
import { fieldError } from "../utils/fieldError";
import { validateLogin } from "../utils/validateLogin";
import { validatePassword } from "../utils/validatePassword";
import { UserRegister } from "../interfaces/UserRegister";
import { UserResponse } from "../interfaces/UserResponse";
import { UserLogin } from "../interfaces/UserLogin";
import {Request, Response} from "express";
import { COOKIE_NAME } from "../constants";
import { UserProfileEdit } from "../interfaces/UserEdit";
import { validateEmail } from "../utils/validateEmail";
import { sendEmailForgotPassword } from "../utils/email";
import { v4 } from "uuid";
import { Redis } from "ioredis";
import { getConnection } from "typeorm";


//validate registration
export const createUser: (userCreation: UserRegister, req: Request) => Promise<UserResponse> = async function(userCreation: UserRegister, req: Request): Promise<UserResponse> {
    //Validate user - password, and email
    const errors = validateRegister(userCreation);
    if (errors){
        return errors;
    }
    //create hashed bcrypt password
    const password = await createPassword(userCreation.password);

    let user: User | undefined;
    try {
        user = await User.create({username: userCreation.username.toLowerCase(), password: password, email: userCreation.email}).save();
    } 
    catch (err){
        if (err.code === "23505"){
            if (err.detail.includes("username")){
                return {errors: [
                    fieldError("username", "username already exists")
                ]};
            }
            if (err.detail.includes("email")){
                return {errors: [
                    fieldError("email", "email already exists")
                ]};
            }
        }
    }
    
    //set the cookie and login the user
    //regenerate to change ssid and prevent session fixation
    return await new Promise((res) => req.session.regenerate((err) => {
        req.session.userId = user!.id;
        res({user: user});
    }));
}

//validate login
export const login: (userLogin: UserLogin, req: Request) => Promise<UserResponse> = async function(userLogin: UserLogin, req: Request): Promise<UserResponse> {

    //validate login - username or email, and password
    const errors = validateLogin(userLogin);
    if (errors){
        return errors;
    }
    //get user from db
    const user = await User.findOne({where: 
        userLogin.usernameOrEmail.includes("@") 
        ? {email: userLogin.usernameOrEmail} 
        : {username: userLogin.usernameOrEmail}}
        );
    //username or email already exist
    if (!user){
        if (userLogin.usernameOrEmail.includes("@")){
            return {errors: [
                fieldError("usernameOrEmail", "email doesn't exist")
            ]};
        }
        else {
            return {errors: [
                fieldError("usernameOrEmail", "username doesn't exist")
            ]};
        }
    }
    const success = await comparePassword(userLogin.password, user.password);
    if (!success){
        return {errors: [
            fieldError("password", "incorrect password")
        ]};
    }
    //set the cookie and login the user
    //regenerate to change ssid and prevent session fixation
    return await new Promise((res) => req.session.regenerate((err) => {
        req.session.userId = user!.id;
        res({user: user});
    }));
}

//if logged in return user
export const me: (req: Request) => Promise<UserResponse | null > = async function(req: Request): Promise<UserResponse | null> {
    if (!req.session.userId){
        return null;
    }
    const user: any = await User.findOne({where: {id: req.session.userId}})
    return user;
}

//logout
export const logout: (req: Request, res: Response) => Promise<boolean> = async function(req: Request, res: Response): Promise<boolean> {
    //req.session.destroy utilizes a callback, wait for callback by making use of promise
    //clear cookie from redis
    return await new Promise(resolve => req.session.destroy((err) => {
        //clear cookie from response
        res.clearCookie(COOKIE_NAME);
        if (err){
            resolve(false);
        }
        resolve(true);
    }));
}

export const editProfile: (userEdit: UserProfileEdit, req: Request) => Promise<UserResponse | null> = async function(userEdit: UserProfileEdit, req: Request): Promise<UserResponse | null> {
    
    if (userEdit.firstName.length > 50 || userEdit.lastName.length > 50){
        return {errors: [
            fieldError("name", "name too long")
        ]};
    }
    
    await User.update({id: req.session.userId}, {firstName: userEdit.firstName, lastName: userEdit.lastName});

    return null;
}

export const forgotPassword: (email: string, redis: Redis) => Promise<UserResponse | null> = async function (email: string, redis: Redis): Promise<UserResponse | null> {
    const error = validateEmail(email);
    if (error){
        return error;
    }
    //check if email exists
    const user = await User.findOne({where: {email}});
    if (!user){
        return {errors: [
            fieldError("email", "email doesn't exist")
        ]};
    }

    //Generate uuid token
    const token = v4();

    //expires after 2 hours
    let expire = new Date();
    expire.setHours(expire.getHours() + 2);

    let entry: ForgotPassword | undefined;
    try {
        entry = await ForgotPassword.create({token: token, userid: user.id, expires: expire}).save();
    }
    catch (err){
        if (err.code === "23505"){
            if (err.detail.includes("userid")){
                return {errors: [
                    fieldError("token", "A token has already been generated for that account")
                ]};
            }
        }
    }

    await sendEmailForgotPassword(email, `<a href="http://localhost:3000/change-password-email/${token}">Click here to change your password</a>`);

    return null;
}

export const changePassword: (password: string, token: string) => Promise<UserResponse | null> = async function (password: string, token: string): Promise<UserResponse | null> {
    const error = validatePassword(password);
    if (error){
        return error;
    }

    //First check if any tokens are expired within the database, and delete if they are
    //Tokens are expired if 2 hours have passed

    await getConnection().createQueryBuilder().delete().from(ForgotPassword).where('expires <= :currentDate', {currentDate: new Date()}).execute();

    const entry = await ForgotPassword.findOne({where: {token}});
    //Either token was never generated or the token expired
    if (!entry){
        return {errors: [
            fieldError("token", "Token expired")
        ]};
    }

    const user = await User.findOne({where: {id: entry.userid}});

    if (!entry){
        return {errors: [
            fieldError("token", "User no longer exists")
        ]};
    }

    const hashedPassword = await createPassword(password);

    await User.update({id: user!.id}, {password: hashedPassword});

    await ForgotPassword.delete({});

    return null;
}