const express = require("express");
const router = express.Router();

const products = [
  {
    id: "p1",
    name: "Chicken Burger",
    price: 450,
    description: "Crispy chicken burger"
  },
  {
    id: "p2",
    name: "Pizza",
    price: 1200,
    description: "Large cheese pizza"
  },
  {
    id: "p3",
    name: "Cold Drink",
    price: 150,
    description: "Chilled soft drink"
  }
];

// GET all products
router.get("/", (req, res) => {
  res.json(products);
});

// GET single product
router.get("/:id", (req, res) => {
  const product = products.find(p => p.id === req.params.id);

  if (!product) {
    return res.status(404).json({
      message: "Product not found"
    });
  }

  res.json(product);
});

module.exports = router;