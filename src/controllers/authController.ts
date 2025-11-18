import type { Request,Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

export const session = (req:Request,res:Response)=>{
  try{
    const token = req.cookies.token;
    if(!token){
      throw new Error("Unauthorized");
    }
    const decoded = jwt.verify(token,process.env.JWT_SECRET as string);
    res.status(200).json({success:true,data:decoded,error:null});
  }
  catch(error:any){
    res.status(401).json({success:false,data:null,error:error.message});
  }
}
export const signin = (req:Request,res:Response)=>{
  try{
    const {username,password} = req.body;
  if(username !== "ADMIN@ADMIN"){
    throw new Error("User not found");
  }
  if(password !== "ROOT"){
    throw new Error("Invalid password");
  }
  const token = jwt.sign({id:1,username,isAdmin:true},process.env.JWT_SECRET as string,{expiresIn:"7d"});
  res.cookie("token",token,{
    maxAge: 1000*60*60*24*7, // 7 days
    httpOnly: true  
  });
  res.status(200).json({success:true,error:null});
  }
  catch(error:any){
    res.status(401).json({success:false,error:error.message});
  }
}
export const signup = (req:Request,res:Response)=>{}
export const signout = (req:Request,res:Response)=>{
  try{
    res.clearCookie("token");
    res.status(200).json({success:true});
  }
  catch(error){
    res.status(401).json({success:false});
  }
}
