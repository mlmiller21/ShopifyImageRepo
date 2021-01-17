import { UserLogin } from "../interfaces/UserLogin";
import { UserResponse } from "../interfaces/UserResponse";
import { validateUsername } from "./validateUsername";
import { validatePassword } from "./validatePassword";
import { validateEmail } from "./validateEmail";

//Validation of registartion
export const validateLogin: (userLogin: UserLogin) => UserResponse | null = function(userLogin: UserLogin): UserResponse | null {
    //validate username
    if (!userLogin.usernameOrEmail.includes("@")){
        const errorUsername = validateUsername(userLogin.usernameOrEmail);
        if (errorUsername){
            return errorUsername;
        }
    }
    //validate email instead
    else {
        const errorEmail = validateEmail(userLogin.usernameOrEmail);
        if (errorEmail){
            return errorEmail;
        }
    }
    const errorPassword = validatePassword(userLogin.password);
    if (errorPassword){
        return errorPassword
    }
    return null;
}