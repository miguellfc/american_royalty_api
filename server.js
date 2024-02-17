import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import cors from "cors";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan"
import * as path from "path";
import { fileURLToPath } from "url";
import { loginRoute, userRoutes, serviceRoutes, typeserviceRoutes, roleRoutes, requestRoutes } from "./routes/routes.js"
import { cnx } from "./pg_connection.js";
import UserController from "./controllers/user-controller.js";
import {verifyToken} from "./middleware/auth-mdw.js";

//Config Middleware
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({
    policy: 'cross-origin'
}));
app.use(morgan("common"));
app.use(bodyParser.json({limit: '30mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '30mb', extended: true}));
app.use(cors());
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

const storage = multer.diskStorage({
    destination: (request,file,callback) => {
        callback(null,'public/assets');
    },
    filename: (request,file,callback) => {
        callback(null, file.originalname);
    }
});

const upload = multer({storage});

// Routes with files
app.post("/user/create", verifyToken, upload.single('foto'), UserController.create);
app.put("/user/update/:id", upload.single('foto'), UserController.update);

//Routes
app.use("/auth", loginRoute);
app.use("/user", userRoutes);
app.use("/roles", roleRoutes);
app.use("/services", serviceRoutes);
app.use("/typeservice", typeserviceRoutes);
app.use("/request", requestRoutes);

const PORT = process.env.PORT || 3030;

cnx.connect()
    .then(() => {
        app.listen(PORT,() => console.log(`Server is running at port: ${PORT}`))
        console.log("Connected to POSTGRES");
    })
    .catch((error) => console.log("Error to connect to POSTGRES"))

//TO DEBUG
// npx nodemon --inspect server.js