import dotenv from "dotenv";
import { createServer } from "node:http";
import {
  addAdminConnection,
  removeAdminConnection,
} from "../utilities/web-push";

dotenv.config();

import app from "../app/index";
import WebSocket from "ws";


import { sequelize } from "../models/index";
const server = createServer(app);
const port = process.env.PORT ?? 5000;
const wss = new WebSocket.Server({ server });

export const connectedAdmins = new Map();
wss.on("connection", (ws, req) => {
  const adminId = req.url?.split("?adminId=")[1];

  if (adminId) {
    addAdminConnection(adminId, ws);
    console.log(`Admin ${adminId} connected`);

    ws.on("close", () => {
      removeAdminConnection(adminId);
      console.log(`Admin ${adminId} disconnected`);
    });
  }
});

sequelize.sync({ alter: true}).then(() => {
  console.log("Connected to MySql");
});

server.listen(port, () => {
  console.log(`Server running on port: ${port} `);
});

