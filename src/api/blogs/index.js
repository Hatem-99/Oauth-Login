import express from "express";
import createHttpError from "http-errors";
import blogModel from "./model.js";

const blogsRouter = express.Router();

blogsRouter.post("/", async (req, res, next) => {
  try {
    const newblog = new blogModel(req.body);
    const { _id } = await newblog.save();

    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});
blogsRouter.get("/", async (req, res, next) => {
  try {
    const blogs = await blogModel.find();
    res.send(blogs);
  } catch (error) {
    next(error);
  }
});
blogsRouter.get("/:blogID", async (req, res, next) => {
  try {
    const blog = await blogModel.findById(req.params.blogID);
    if (blog) {
      res.send(blog);
    } else {
      next(
        createHttpError(404, `User with id ${req.params.blogID} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});
blogsRouter.put("/:blogID", async (req, res, next) => {
  try {
    const updatedBlog = await blogModel.findByIdAndUpdate(
      req.params.blogID,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedBlog) {
      res.send(updatedBlog);
    } else {
      next(
        createHttpError(404, `User with id ${req.params.blogID} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});
blogsRouter.delete("/:blogID", async (req, res, next) => {
  try {
    const deletedBlog = await blogModel.findByIdAndDelete(req.params.blogID);
    if (deletedBlog) {
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `User with id ${req.params.blogID} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

export default blogsRouter;
