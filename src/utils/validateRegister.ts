import { UserRegister } from "../interfaces/UserRegister";
import { UserResponse } from "../interfaces/UserResponse";
import { validateUsername } from "./validateUsername";
import { validatePassword } from "./validatePassword";
import { validateEmail } from "./validateEmail";

//Validation of registartion
export const validateRegister: (userCreation: UserRegister) => UserResponse | null = function(userCreation: UserRegister): UserResponse | null {
    const errorUsername = validateUsername(userCreation.username);
    if (errorUsername){
        return errorUsername;
    }
    const errorPassword = validatePassword(userCreation.password);
    if (errorPassword){
        return errorPassword
    }
    const errorEmail = validateEmail(userCreation.email);
    if (errorEmail){
        return errorEmail;
    }
    return null;

    /**
     * 
    The email address is correct.
    The application can successfully send emails to it.
    The user has access to the mailbox.

    The links that are sent to users to prove ownership should contain a token that is:

    At least 32 characters long.
    Generated using a secure source of randomness.
    Single use.
    Time limited (e.g, expiring after eight hours).

     */
}