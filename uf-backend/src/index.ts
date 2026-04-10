import express from "express";
import cors from "cors";
import fruitsRouter from "./routes/fruits.routes";
import usersRouter from "./routes/users.routes";
import apodRouter from "./routes/apod.routes";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/fruits", fruitsRouter);
app.use("/api/users",  usersRouter);
app.use("/api/apod", apodRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "Backend corriendo en puerto 4000" });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Backend corriendo en http://localhost:${PORT}`);
  console.log(`📡 Rutas disponibles:`);
  console.log(`   GET    /health`);
  console.log(`   GET    /api/fruits`);
  console.log(`   GET    /api/fruits/:id`);
  console.log(`   POST   /api/fruits`);
  console.log(`   PUT    /api/fruits/:id`);
  console.log(`   DELETE /api/fruits/:id`);
  console.log(`   GET    /api/users`);
  console.log(`   GET    /api/users/:id`);
  console.log(`   POST   /api/users`);
  console.log(`   PUT    /api/users/:id`);
  console.log(`   DELETE /api/users/:id`);
  console.log(`   GET    /api/anime`);
  console.log(`   GET    /api/anime/:id`);
  console.log(`   POST   /api/anime`);
  console.log(`   PUT    /api/anime/:id`);
  console.log(`   DELETE /api/anime/:id`);
});