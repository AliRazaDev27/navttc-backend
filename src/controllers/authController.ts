import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import userModel from "../models/userModel.js";

export const session = (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      throw new Error("Unauthorized");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    const user = decoded as { id: string; email: string; role: string };
    res.status(200).json({ success: true, data: user, error: null });
  }
  catch (error: any) {
    res.status(401).json({ success: false, data: null, error: error.message });
  }
}
export const signin = async(req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if(!email || !password) throw new Error("Email and password are required");
    const user = await userModel.findOne({ email }).select("+password");
    if (!user) throw new Error("User not found");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error("Invalid password");
    const token = jwt.sign({ id: user._id, email:user.email, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
    res.cookie("token", token, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    }).status(200).json({ success: true, error: null });
  }
  catch (error: any) {
    res.status(401).json({ success: false, error: error.message });
  }
}
export const signup = async(req: Request, res: Response) => {
  try {
    const { fullName, email, password } = req.body;
    if(!fullName || !email || !password) throw new Error("All fields are required");
    const user = await userModel.create({
      email,
      password,
      firstName:fullName.split(" ")[0],
      lastName:fullName.split(" ")[1] || "",      
    });
    res.status(201).json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }

}
export const signout = (req: Request, res: Response) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ success: true });
  }
  catch (error) {
    res.status(401).json({ success: false });
  }
}
