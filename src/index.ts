import { connection } from "./connection"
import express, {NextFunction, Request, Response} from "express";
import { changePassword, createUser, editProfile, forgotPassword, login, logout, me } from "./controllers/userController";
import redis from "ioredis";
import connectRedis from "connect-redis";
import session from "express-session";


import { COOKIE_NAME, __prod__, maxsize } from "./constants";
import { getImages, uploadImage, searchImages, deleteImage } from "./controllers/imageController";
import { uploadMiddleware } from "./middleware/uploadImage";

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

    //upload files onto temp, validate they're real images before displaying back to user    
     
    //cookie
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

    app.post('/register', async (req: Request, res: Response) => {
        const {username, password, email} = req.body;
        const user = await createUser({username, password, email}, req);
        if (user.errors){
            res.json(user.errors)    
        }
        res.json({success: true});
    })

    app.post('/login', async (req: Request, res: Response) => {
        const {usernameOrEmail, password} = req.body;
        const user = await login({usernameOrEmail, password}, req);
        if (user.errors){
            res.json(user.errors)    
        }
        res.json({success: true});
    })

    app.post('/logout', async (req: Request, res: Response) => {
        const valid = await logout(req, res);
        if (!valid){
            res.json({success: false});
        }
        res.json({success: true})
    })

    app.post('/editProfile', async (req: Request, res: Response) => {
        const {firstName, lastName} = req.body;
        const error = await editProfile({firstName, lastName}, req)
        if (error?.errors){
            res.json(error.errors);
        }
        res.json({success: true})
    })

    app.post('/forgotPassword', async (req: Request, res: Response) => {
        const {email} = req.body;
        const error = await forgotPassword(email, redisClient);
        if (error?.errors){
            res.json(error.errors);
        }
        res.json({success: true})
    })

    app.post('/change-password-email', async (req: Request, res: Response) => {
        const {password, token} = req.body;
        const error = await changePassword(password, token);
        if (error?.errors){
            res.json(error.errors);
        }
        res.json({success: true})
    })

    app.get('/me', async (req: Request, res: Response) => {
        const user = await me(req);
        if (user?.errors){
            res.json(user.errors);
        }
        res.json({success: true})
    })

    app.post('/upload-image', uploadMiddleware, async (req: Request, res: Response) => {
        const image = await uploadImage(req);
        if (image?.errors){
            res.json(image.errors);
        }
        res.json({image})
    })

    app.get('/search-image', async (req: Request, res: Response) => {
        const {search} = req.body;
        const images = await searchImages(req, search);
        if (images?.errors){
            res.json(images.errors);
        }
        res.json({images})
    })

    app.get('/images', async (req: Request, res: Response) => {
        const images = await getImages(req);
        if (images?.errors){
            res.json(images.errors);
        }
        res.json({images})
    })

    app.delete('/:image', async (req: Request, res: Response) => {
        const imageid = req.params.image;
        const image = await deleteImage(imageid, req);
        if (image?.errors){
            res.json(image.errors);
        }
        res.json({success: true})
    })

    app.use('/repo/:id', function(req: Request, res: Response, next: NextFunction){
        console.log(req.session.userId);
        console.log(req.params.id);
        if (req.session.userId !== parseInt(req.params.id)){
            return ({error: 'invalid access'});
        }
        next();
    },
    express.static(__dirname + "/repo"));
    console.log("dir name " + __dirname)

    app.listen(port, () => {
        console.log(`server started on http://localhost:${port}`);
    })
    
}


main();