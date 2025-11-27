import type { Request, Response } from "express"
import userModel from "../models/userModel.js"
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await userModel.find();
        res.status(200).json({success:true,data:users});
    } catch (error) {
        res.status(400).json({status:false,data:[]})
    }
}