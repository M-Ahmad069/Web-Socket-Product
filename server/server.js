const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// ========================================
// SOCKET.IO
// ========================================

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// ========================================
// REST APIs
// ========================================

app.use(
  "/api/v1/products",
  require("./routes/products")
);

app.use(
  "/api/v1/orders",
  require("./routes/orders")
);

const orders = require("./data/orders");

// ========================================
// SSE CLIENTS
// ========================================

let sseClients = [];

// SSE endpoint
app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  sseClients.push(res);

  console.log("SSE client connected");

  // Keep connection alive
  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);

    sseClients = sseClients.filter(
      (client) => client !== res
    );

    console.log("SSE client disconnected");
  });
});

// Send SSE event to all connected clients
function sendSSE(data) {
  sseClients.forEach((client) => {
    client.write(
      `data: ${JSON.stringify(data)}\n\n`
    );
  });
}

// ========================================
// TEST ROUTE
// ========================================

app.get("/", (req, res) => {
  res.json({
    message: "Real-Time Order Tracker API is running",
  });
});

// ========================================
// JSON-RPC 2.0
// ========================================

app.post("/rpc", (req, res) => {
  const { jsonrpc, method, params, id } = req.body;

  if (jsonrpc !== "2.0") {
    return res.json({
      jsonrpc: "2.0",
      error: {
        code: -32600,
        message: "Invalid Request",
      },
      id: id || null,
    });
  }

  if (method === "cancelOrder") {
    const orderId = params?.orderId;

    const order = orders.find(
      (order) => order.id === orderId
    );

    if (!order) {
      return res.json({
        jsonrpc: "2.0",
        error: {
          code: -32602,
          message: "Order not found",
        },
        id,
      });
    }

    order.status = "cancelled";

    // WebSocket notification
    io.to(`order:${orderId}`).emit(
      "orderStatusUpdated",
      {
        orderId,
        status: "cancelled",
      }
    );

    // SSE notification
    sendSSE({
      type: "ORDER_CANCELLED",
      message: `Order #${orderId} has been cancelled`,
      orderId,
      status: "cancelled",
    });

    return res.json({
      jsonrpc: "2.0",
      result: {
        message: "Order cancelled successfully",
        orderId,
        status: "cancelled",
      },
      id,
    });
  }

  return res.json({
    jsonrpc: "2.0",
    error: {
      code: -32601,
      message: "Method not found",
    },
    id,
  });
});

// ========================================
// SOCKET.IO
// ========================================

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join order room
  socket.on("joinOrder", (orderId) => {
    socket.join(`order:${orderId}`);

    console.log(
      `${socket.id} joined order:${orderId}`
    );
  });

  // Update order status
  socket.on(
    "updateOrderStatus",
    ({ orderId, status }) => {
      const order = orders.find(
        (order) => order.id === orderId
      );

      if (!order) {
        socket.emit("errorMessage", {
          message: "Order not found",
        });

        return;
      }

      order.status = status;

      console.log(
        `Order ${orderId} updated to ${status}`
      );

      // WebSocket update
      io.to(`order:${orderId}`).emit(
        "orderStatusUpdated",
        {
          orderId,
          status,
        }
      );

      // SSE update
      sendSSE({
        type: "ORDER_STATUS_UPDATED",
        message: `Order #${orderId} is now ${status}`,
        orderId,
        status,
      });
    }
  );

  // Join chat room
  socket.on("joinChat", (roomId) => {
    socket.join(`chat:${roomId}`);

    console.log(
      `${socket.id} joined chat:${roomId}`
    );
  });

  // Chat message
  socket.on(
    "chatMessage",
    ({ roomId, sender, message }) => {
      const messageData = {
        sender,
        message,
        createdAt: new Date(),
      };

      io.to(`chat:${roomId}`).emit(
        "newMessage",
        messageData
      );

      // SSE notification
      sendSSE({
        type: "NEW_CHAT_MESSAGE",
        message: `New message from ${sender}`,
        sender,
      });
    }
  );

  socket.on("disconnect", () => {
    console.log(
      "User disconnected:",
      socket.id
    );
  });
});

// ========================================
// START SERVER
// ========================================

const PORT = 5000;

server.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});