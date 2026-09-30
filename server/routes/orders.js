const express = require("express");
const router = express.Router();

const orders = require("../data/orders");

// GET all orders
router.get("/", (req, res) => {
  res.json(orders);
});

// GET single order
router.get("/:id", (req, res) => {
  const order = orders.find(o => o.id === req.params.id);

  if (!order) {
    return res.status(404).json({
      message: "Order not found"
    });
  }

  res.json(order);
});

// CREATE order
router.post("/", (req, res) => {
  const { customerName, items, total } = req.body;

  const newOrder = {
    id: String(Date.now()),
    customerName,
    items,
    total,
    status: "pending"
  };

  orders.push(newOrder);

  res.status(201).json(newOrder);
});

module.exports = router;