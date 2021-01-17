import "reflect-metadata"
import { Connection, createConnection } from "typeorm";
import { dbConfig } from "./typeormconfig";
import { User } from "./entities/User";
import { ForgotPassword } from "./entities/ForgotPassword";
import { Images } from "./entities/Images";
import { Tags } from "./entities/Tags";

export const connection: Promise<Connection> = createConnection({
    type: "postgres",
    database: dbConfig.database,
    username: dbConfig.username,
    password: dbConfig.password,
    logging: true,
    synchronize: true,
    entities: [User, ForgotPassword, Images, Tags]
});