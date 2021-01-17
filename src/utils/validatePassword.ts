import { UserResponse } from "../interfaces/UserResponse";
import { fieldError } from "../utils/fieldError";

//validate password
export const validatePassword: (password: string) => UserResponse | null = function(password: string): UserResponse | null {
    //can't be empty, must be at least 8 characters
    if (password.length < 8){
        return {
            errors: [
                fieldError("password", "password must be at least 8 characters")
            ]
        }
    }
    return null;
}