import express from "express";
import { getAllUsers, getSingleUser, updateUser, deleteUser } from "../controllers/userController.js";

const app = express.Router();

app.get('/', getAllUsers);

app.get('/:id', getSingleUser);

app.put('/:id', updateUser);

app.delete('/:id', deleteUser);

export default app;