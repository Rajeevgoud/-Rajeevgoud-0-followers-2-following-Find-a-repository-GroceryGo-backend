import expressAsyncHandler from "express-async-handler";
import express from "express";
import mongoose from "mongoose";  // Import mongoose for ObjectId handling

import Order from "../models/orderModal.js";
import User from "../models/userModel.js";
import isAuth from "../middleware/index.js";

const orderRouter = express.Router();

orderRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    if (!req.body.id) {
      return res.status(400).send({ message: "User ID is required." });
    }

    if (req.body.orderItems.length === 0) {
      return res.status(400).send({ message: "Please add some products!" });
    }

    // Convert product _id to ObjectId (for each item in orderItems)
    const orderItems = req.body.orderItems.map(item => {
      return {
        ...item,
        _id: mongoose.Types.ObjectId(item._id)  // Convert string _id to ObjectId
      };
    });

    // Create a new order using the 'id' from the body
    const order = new Order({
      orderItems: orderItems,
      customerAddress: req.body.customerAddress,
      itemsPrice: req.body.cartTotal,
      taxPrice: req.body.taxes,
      shippingPrice: req.body.shippingPrice,
      totalPrice: req.body.totalPrice,
      user: req.body.id,  // Use the 'id' from the request body
      isPaid: req.body.isPaid,
    });

    // Save the new order to the database
    const newOrder = await order.save();

    // Send the response with the created order
    res.status(201).send({ message: "New Order Received", order: newOrder });
  })
);

orderRouter.get(
  "/myorders",
  expressAsyncHandler(async (req, res) => {
    if (!req.body.id) {
      return res.status(400).send({ message: "User ID is required." });
    }

    // Fetch orders based on 'id' from the request body
    const orders = await Order.find({ user: req.body.id });

    // If no orders are found, return a message
    if (!orders.length) {
      return res.status(404).send({ message: "No orders found for this user." });
    }

    // Send the found orders as the response
    res.send(orders);
  })
);

export default orderRouter;
