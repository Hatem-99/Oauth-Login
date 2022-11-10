import mongoose from "mongoose";

const { Schema, model } = mongoose;

const blogsSchema = new Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    cover: { type: String, required: true },
    readTime: {
      value: { type: Number },
      unit: { type: Number },
    },
      userId: [],
   
    content: { type: String },
  },
  {
    timestamps: true,
  }
);

export default model("blog", blogsSchema);
