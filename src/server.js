import express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import mongoose from "mongoose";
import blogsRouter from "./api/blogs/index.js";
import { forbiddenErrorHandler, genericErrorHandler,notFoundErrorHandler, unauthorizedErrorHandler } from "./errorHandling.js";
import usersRouter from "./api/users/index.js";
import googleStrategy from "./api/users/lib/google.js";
import passport from "passport";

passport.use("google", googleStrategy)

const server = express();
const port = 3001;

server.use(cors());
server.use(express.json());
server.use(passport.initialize())

server.use("/blogs", blogsRouter)
server.use("/users", usersRouter)

server.use(unauthorizedErrorHandler)
server.use(forbiddenErrorHandler)
server.use(notFoundErrorHandler)
server.use(genericErrorHandler)

mongoose.connect(process.env.MONGO_CONNECTION_URL);

mongoose.connection.on("connected", () => {
  console.log("Successfully connected to MongoDB!");
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`Server is running on port ${port}`);
  });
});
