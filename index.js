const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const authMiddleware = require("./middleware/authMiddleware");
const adminOnly = require("./middleware/roleMiddleware");
const { products } = require("./data/products");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const SECRET = "jwtSecret123";

const users = [
  { email: "admin@inv.com", password: "admin123", role: "admin" },
  { email: "staff@inv.com", password: "staff123", role: "staff" },
];

// ------------------------ AUTH ------------------------
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  if (user.password !== password) return res.status(401).json({ message: "Wrong password" });

  const token = jwt.sign({ email: user.email, role: user.role }, SECRET, { expiresIn: "1h" });
  return res.json({ message: "Login success", data: { token, role: user.role } });
});

// ------------------------ PRODUCTS ------------------------

// GET products with pagination & filtering
app.get("/api/products", authMiddleware, (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  let filtered = [...products];

  if (status && status !== "all") {
    filtered = filtered.filter((p) => {
      if (status === "in-stock") return p.quantity > 10;
      if (status === "low-stock") return p.quantity > 0 && p.quantity <= 10;
      if (status === "out-of-stock") return p.quantity === 0;
    });
  }

  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + +limit);

  res.json({
    total: filtered.length,
    page: +page,
    limit: +limit,
    products: paginated,
  });
});

// ADD product (admin only)
app.post("/api/products", authMiddleware, adminOnly, (req, res) => {
  const { name, quantity } = req.body;
  if (!name || quantity == null) return res.status(400).json({ message: "Missing name or quantity" });

  const newProduct = {
    id: Date.now().toString(),
    name,
    quantity,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  products.push(newProduct);
  res.status(201).json({ message: "Product added", product: newProduct });
});

// UPDATE product (admin only)
app.put("/api/products/:id", authMiddleware, adminOnly, (req, res) => {
  const { id } = req.params;
  const { name, quantity } = req.body;

  const product = products.find((p) => p.id === id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  product.name = name ?? product.name;
  product.quantity = quantity ?? product.quantity;
  product.updatedAt = new Date();

  res.json({ message: "Product updated", product });
});

// DELETE product (admin only)
app.delete("/api/products/:id", authMiddleware, adminOnly, (req, res) => {
  const { id } = req.params;
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return res.status(404).json({ message: "Product not found" });

  products.splice(index, 1);
  res.json({ message: "Product deleted" });
});

app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));
