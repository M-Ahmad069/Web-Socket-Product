import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import API from "./api";

const socket = io("http://localhost:5000");

function App() {
  const [order, setOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [role, setRole] = useState("Customer");

  useEffect(() => {
    // Get order from REST API
    API.get("/api/v1/orders/101")
      .then((res) => {
        setOrder(res.data);
      })
      .catch((err) => {
        console.error("Failed to get order:", err);
      });

    // Join order room
    socket.emit("joinOrder", "101");

    // Join support chat room
    socket.emit("joinChat", "order-101-chat");

    // Receive real-time order status
    socket.on("orderStatusUpdated", (data) => {
      setOrder((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          status: data.status,
        };
      });
    });

    // Receive new chat messages
    socket.on("newMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    // Cleanup listeners
    return () => {
      socket.off("orderStatusUpdated");
      socket.off("newMessage");
    };
  }, []);

  // Update order status using WebSocket
  const updateStatus = (status) => {
    socket.emit("updateOrderStatus", {
      orderId: "101",
      status: status,
    });
  };

  // Send support chat message
  const sendMessage = () => {
    if (!message.trim()) {
      return;
    }

    socket.emit("chatMessage", {
      roomId: "order-101-chat",
      sender: role,
      message: message,
    });

    setMessage("");
  };

  // Loading state
  if (!order) {
    return (
      <div style={{ padding: "30px" }}>
        <h1>Loading Order...</h1>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "900px",
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Real-Time Order Tracker</h1>

      <hr />

      {/* ORDER INFORMATION */}
      <h2>Order #{order.id}</h2>

      <p>
        <strong>Customer:</strong> {order.customerName}
      </p>

      <p>
        <strong>Total:</strong> Rs. {order.total}
      </p>

      <h3>
        Current Status:{" "}
        <strong>{order.status}</strong>
      </h3>

      <hr />

      {/* STATUS CONTROLS */}
      <h2>Support - Change Order Status</h2>

      <button onClick={() => updateStatus("confirmed")}>
        Confirm
      </button>

      {" "}

      <button onClick={() => updateStatus("preparing")}>
        Preparing
      </button>

      {" "}

      <button
        onClick={() => updateStatus("out for delivery")}
      >
        Out for Delivery
      </button>

      {" "}

      <button onClick={() => updateStatus("delivered")}>
        Delivered
      </button>

      <hr />

      {/* SUPPORT CHAT */}
      <h2>1-on-1 Support Chat</h2>

      <label>
        <strong>Your Role: </strong>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="Customer">Customer</option>
          <option value="Support Agent">
            Support Agent
          </option>
        </select>
      </label>

      <br />
      <br />

      {/* CHAT MESSAGES */}
      <div
        style={{
          border: "1px solid #999",
          padding: "15px",
          minHeight: "200px",
          marginBottom: "15px",
          overflowY: "auto",
        }}
      >
        {messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          messages.map((msg, index) => (
            <p key={index}>
              <strong>{msg.sender}:</strong>{" "}
              {msg.message}
            </p>
          ))
        )}
      </div>

      {/* MESSAGE INPUT */}
      <input
        type="text"
        value={message}
        onChange={(e) =>
          setMessage(e.target.value)
        }
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            sendMessage();
          }
        }}
        placeholder="Type your message..."
        style={{
          padding: "8px",
          width: "70%",
          marginRight: "10px",
        }}
      />

      <button onClick={sendMessage}>
        Send
      </button>
    </div>
  );
}

export default App;