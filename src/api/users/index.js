import express from "express";
import createHttpError from "http-errors";
import { adminOnlyMiddleware } from "./lib/adminonly.js";
import UsersModel from "./model.js";
import blogsModel from "../blogs/model.js";
import { JwtAuthenticationMiddleware } from "./lib/tokenBaseAuth.js";
import { createTokens, verifyAccessRefreshToken, verifyRefreshAndCreateNewTokens } from "./lib/tools.js";
import { checkUserSchema } from "./validator.js";

const usersRouter = express.Router();

usersRouter.post("/", async (req, res, next) => {
  try {
    const newUser = new UsersModel(req.body);
    const { _id } = await newUser.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/", JwtAuthenticationMiddleware, async (req, res, next) => {
  try {
    const users = await UsersModel.find({});
    res.send(users);
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/me", JwtAuthenticationMiddleware, async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/me", JwtAuthenticationMiddleware, async (req, res, next) => {
  try {
    const updatedUser = await UsersModel.findByIdAndUpdate(
      req.user._id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    res.send(updatedUser);
  } catch (error) {
    next(error);
  }
});

usersRouter.delete(
  "/me",
  JwtAuthenticationMiddleware,
  async (req, res, next) => {
    try {
      await UsersModel.findByIdAndDelete(req.user._id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.get(
  "/:userId",
  JwtAuthenticationMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const user = await UsersModel.findById(req.params.userId);
      res.send(user);
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.delete(
  "/:userId",
  JwtAuthenticationMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const user = await UsersModel.findByIdAndDelete(req.params.userId);
      if (user) {
        res.status(204).send();
      } else {
        next(
          createHttpError(404, `User with Id ${req.params.userId} not found!`)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.get(
  "/me/stories",
  JwtAuthenticationMiddleware,
  async (req, res, next) => {
    try {
      const blogs = await blogsModel.find({
        userId: { $in: [req.user._id.toString()] },
      });
      console.log(blogs);

      res.send(blogs);
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.post("/register", checkUserSchema, async (req, res, next) => {
  try {
    const newUser = new UsersModel(req.body);
    const { _id } = await newUser.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await UsersModel.checkCredentials(email, password);

    if (user) {
      const { accessToken, refreshToken } = await createTokens(user);
      res.send({ accessToken, refreshToken });
    } else {
      next(createHttpError(401, `Credentials are not ok!`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/refreshTokens", async (req, res, next) => {
  try {
    const { currentrefreshToken } = req.body;

    const { accessToken, refreshToken } = await verifyRefreshAndCreateNewTokens(
      currentrefreshToken
    );
    console.log(accessToken,refreshToken)

    res.send({ accessToken, refreshToken });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

export default usersRouter;
