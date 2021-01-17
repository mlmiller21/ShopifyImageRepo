import { usernameRe } from "../regex"
import { UserResponse } from "../interfaces/UserResponse";
import { fieldError } from "../utils/fieldError";

//validate username
export const validateUsername: (username: string) => UserResponse | null = function(username: string): UserResponse | null {
    //validate user
    //username can't be empty
    if (username.length <= 2) {
        return {errors: [
            fieldError("username", "username length must be greater than 2")
            ]
        }
    }
    //user can't be greater than 50
    if (username.length > 50) {
        return {
            errors: [
                fieldError("username", "length must be less than 51")
            ]
        }
    }
    //Letters, numbers, dashes, and underscores only
    if (!usernameRe.test(username)){
        return {
            errors: [
                fieldError("username", "Letters, numbers, dashes, and underscores only")
            ]
        }
    }
    return null;
}