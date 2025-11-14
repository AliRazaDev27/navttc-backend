import express from "express";
import { session, signin, signout, signup } from "../controllers/authController.js";

const app = express.Router();

app.get("/session",session);
app.post("/signin",signin);
app.post("/signup",signup);
app.get("/signout",signout);

export default app;