import express, { Application } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { AppDataSource } from "./data-source";
import adminRoutes from "./routes/admin";
import publicRoutes from "./routes/public";
import { initializeSocket } from './socket';
import http from "http";

// Initialize the database and start the server
AppDataSource.initialize()
  .then(() => {
    console.log("Database connected!");

    const app: Application = express();
    const server = http.createServer(app);

    const PORT = process.env.PORT || 5000;


    initializeSocket(server);

    // Middleware
    app.use(bodyParser.json());
    app.use(cors());

    app.get("/", (req, res) => {
      res.send("Status App API");
    });

    // Routes
    app.use("/api/admin", adminRoutes);
    app.use("/api/public", publicRoutes);

    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  })
  .catch((error) => console.error("Database connection failed:", error));
