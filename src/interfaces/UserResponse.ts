import { User } from "../entities/User";

export interface Error {
    field: string,
    message: string
}

export interface UserResponse {
    errors?: Error[],
    user?: User
}