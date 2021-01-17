import { connection } from "./connection"
import express, {Request, Response} from "express";
import { User } from "./entities/User";
import { changePassword, createUser, editProfile, forgotPassword, login, logout, me } from "./controllers/userController";
import redis from "ioredis";
import connectRedis from "connect-redis";
import session from "express-session";
import { COOKIE_NAME, __prod__ } from "./constants";

declare module "express-session" {
    interface Session {
      userId: number;
    }
  }

const port = process.env.PORT || 4000;

const main: any = async () => {
    await connection;

    const app: express.Application = express();

    // support application/json type post data
    app.use(express.json());
    // support application/x-www-form-urlencoded post data
    app.use(express.urlencoded({extended: false}))

    // Hide use of express
    app.disable('x-powered-by');

    const redisStore: connectRedis.RedisStore = connectRedis(session);
    const redisClient = new redis();

    //
    app.use(
        session({
            name: COOKIE_NAME,
            store: new redisStore({
                client: redisClient,
                disableTouch: true
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365, //10 years
                httpOnly: true, // Not accessible by Document.cookie
                secure: __prod__, // true for https
                sameSite: 'lax'
            },
            saveUninitialized: false,
            secret: 'seeeecret',
            resave: false,
        })
    )

    app.get('/', (req: Request, res: Response) => {
        res.send("hello world");
    })

    app.get('/register', (req: Request, res: Response) => {
        res.send("register get");
    })

    app.post('/register', async (req: Request, res: Response) => {
        const {username, password, email} = req.body;
        const user = await createUser({username, password, email}, req);

        console.log(user);

        res.json(req.body);
    })

    app.post('/login', async (req: Request, res: Response) => {
        const {usernameOrEmail, password} = req.body;
        const user = await login({usernameOrEmail, password}, req);
        console.log("session");
        console.log(req.session);

        console.log(user);

        res.json(req.body);

    })

    app.post('/logout', async (req: Request, res: Response) => {
        const valid = await logout(req, res);
        console.log("logged out!");
        res.json(req.body);
    })

    app.post('/editProfile', async (req: Request, res: Response) => {
        const {firstName, lastName} = req.body;
        const error = await editProfile({firstName, lastName}, req)
        console.log("edited!");
        res.json(req.body);
    })

    app.post('/forgotPassword', async (req: Request, res: Response) => {
        const {email} = req.body;
        const error = await forgotPassword(email, redisClient);
        console.log("done!");
        res.json(req.body);
    })

    app.post('/change-password-email', async (req: Request, res: Response) => {
        const {password, token} = req.body;
        const error = await changePassword(password, token);
        console.log("done!");
        console.log(error);
        res.json(req.body);

    })

    app.get('/me', async (req: Request, res: Response) => {
        const user = await me(req);
        console.log(user);
        res.json(req.body);
    })

    app.listen(port, () => {
        console.log(`server started on http://localhost:${port}`);
    })
    
}


main();