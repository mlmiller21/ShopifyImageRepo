import bcrypt from "bcrypt";

//Create a salted and hashed password to store in the database
export const createPassword: (password: string) => Promise<string> = function (password: string): Promise<string> {
    return new Promise((res, rej) => {
        const workFactor = 12;
        //bcrypt encodes in base64
        //bcrypt prepends a cryptographically secure random salt to the hash
        bcrypt.genSalt(workFactor, function(err, salt) {
            if (err){
                rej(err);
            }
            bcrypt.hash(password, salt, function(err, hash){
                if (err){
                    rej(err);
                }
                res(hash);
            })
        })
    })
}

//compare user password with hashed salted password 
export const comparePassword: (userPassword: string, dbPassword: string) => Promise<boolean> = async function (userPassword: string, dbPassword: string): Promise<boolean> {
    return new Promise((res, rej) => {  
        bcrypt.compare(userPassword, dbPassword, function(err, result){
            if (err){
                rej(err);
            }
            res(result);
        })
    })
}