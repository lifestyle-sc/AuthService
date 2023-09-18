import { ConfigProps } from "./config.interface";

export const config = ():ConfigProps => ({
    auth: {
        secretKey: process.env.SECRET_KEY,
        hashSalt: process.env.HASH_SALT,
        accessTokenDuration: process.env.ACCESS_TOKEN_DURATION
    },
    port: parseInt(process.env.PORT) || 3000,
    mongodb: {
        uri: process.env.MONGODB_URI
    }
})