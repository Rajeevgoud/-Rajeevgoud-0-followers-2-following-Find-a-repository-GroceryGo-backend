import express from "express";
import expressAsyncHandler from "express-async-handler";
import dotenv from "dotenv";
import { generateToken } from "../utils/index.js";

import User from "../models/userModel.js";
import isAuth from "../middleware/index.js";  // Authentication middleware

const userRouter = express.Router();
dotenv.config();

userRouter.post(
  "/register",  // Register a new user
  expressAsyncHandler(async (req, res) => {
    const { phone, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).send({ message: "User already exists" });
    }

    // Create a new user if not found
    const newUser = new User({
      phone,
      name: name || "Anonymous",  // Default name if not provided
    });
    const createdUser = await newUser.save();
    res.status(201).send({
      _id: createdUser._id,
      phone: createdUser.phone,
      isAdmin: createdUser.isAdmin,
      token: generateToken(createdUser),  // JWT token for authentication
      message: "User successfully registered",
    });
  })
);

userRouter.post(
  "/login",  // Login a user (existing user)
  expressAsyncHandler(async (req, res) => {
    const { phone } = req.body;

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).send({ message: "User not found" });
    }

    // Send response with JWT token
    res.status(200).send({
      _id: user._id,
      phone: user.phone,
      userName: user.name,
      isAdmin: user.isAdmin,
      token: generateToken(user),  // JWT token for authentication
      message: "User login successful",
    });
  })
);

userRouter.put(
  "/username",  // Update user's name
  isAuth,  // Only authenticated users can update their name
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).send({ message: "User not found!" });
    }
    user.name = req.body.name;
    await user.save();
    res.status(200).send({ name: user.name });
  })
);

export default userRouter;
