import { Error } from "../interfaces/UserResponse";

export const fieldError: (field: string, message: string) => Error = function(field: string, message: string): Error {
    return {field, message};
}