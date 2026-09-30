# Real-Time Order Tracker & Live Support System

A full-stack real-time web application developed for **CSC337 - Lab Assignment 04**.

This project demonstrates multiple communication protocols in a single web application:

- REST API
- WebSockets using Socket.IO
- JSON-RPC 2.0
- Server-Sent Events (SSE)

The system provides order management, real-time order tracking, one-to-one customer/support communication, order cancellation, and live system alerts.

---

## 📌 Project Overview

The **Real-Time Order Tracker & Live Support System** is designed to demonstrate how different communication protocols can be used together in a modern full-stack web application.

The application contains two main concepts:

**Customer**
- View order information
- Track order status in real time
- Communicate with support
- Cancel an order

**Support Agent**
- View and update order status
- Communicate with customers
- Trigger real-time updates

---

## 🎯 Assignment Requirements

This project implements all required communication mechanisms:

| Requirement | Implementation |
|---|---|
| Resource Management | REST API |
| Real-Time Order Updates | Socket.IO / WebSocket |
| 1-to-1 Support Chat | Socket.IO / WebSocket |
| Method-Based Actions | JSON-RPC 2.0 |
| Live Server Alerts | Server-Sent Events |
| Frontend | React + Vite |
| Backend | Node.js + Express |

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────────┐
                    │       React Frontend    │
                    │       Vite + React      │
                    └────────────┬────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
        REST API            WebSocket          JSON-RPC 2.0
       /api/v1/...           Socket.IO             /rpc
              │                  │                  │
              └──────────────────┼──────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │    Node.js + Express    │
                    │      Backend Server     │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │    In-Memory Order Data  │
                    └─────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ Server-Sent Events (SSE)│
                    │        /events          │
                    └─────────────────────────┘
