import { Error } from "./UserResponse"

export interface ImageResponse {
    errors?: Error[],
    images?: string[]
}

