interface AuthConfigProps {
    secretKey: string;
    hashSalt: string;
    accessTokenDuration: string;
}

interface MongoDbProps {
    uri: string;
}

export interface ConfigProps {
    auth: AuthConfigProps;
    port: number;
    mongodb: MongoDbProps;
}