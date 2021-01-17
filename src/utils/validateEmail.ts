import { emailRe } from "../regex"
import { UserResponse } from "../interfaces/UserResponse";
import { fieldError } from "../utils/fieldError";

//validate email
export const validateEmail: (email: string) => UserResponse | null = function(email: string): UserResponse | null {
    if (email.length < 3){
        return {
            errors: [
                fieldError("email", "email too short")
            ]
        }
    }
    //The total length should be no more than 254 characters.
    if (email.length > 254){
        return {
            errors: [
                fieldError("email", "email too long")
            ]
        }
    }
    //The local part (before the @) should be no more than 63 characters.
    if (email.split("@")[0].length > 63){
        return {
            errors: [
                fieldError("email", "local part must be less than 64")
            ]
        }
    }
    if (!emailRe.test(email)){
        return {
            errors: [
                fieldError("email", "invalid email, try again")
            ]
        }
    }
    return null;
}