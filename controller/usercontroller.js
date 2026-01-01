const User=require('../model/userModel');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const dotenv=require('dotenv');
const varifyEmail=require('../email/varifymail');
const varifyotp=require('../email/varifyotp');
const Sessions=require('../model/sessionsModel');
const { trace } = require('../routes/useRouter');
const { body, validationResult } =require("express-validator");
dotenv.config();
exports.postRegister= async (req,res)=>{
    const {username,email,password}=req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    return res.status(400).json({success:false, message: errors.array().map(err => err.msg)});
    }
    const existingUser=await User.findOne({email});
    if(existingUser){
        return res.status(409).json({success:false,message:"User already exists"});
    }
    const hashedPassword=bcrypt.hashSync(password,10);
    const user=new User({username,email,password:hashedPassword});
    const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'1h'});
    user.token=token;
    try{
       varifyEmail(email,token);
    }
     catch(err){
        return res.status(500).json({success:false,message:"Error sending verification email"});
     }
   await user.save();
    res.status(201).json({success:true,message:"User registered successfully",token});
}
exports.varifyUser=async(req,res)=>{
   try{
      const authHeader=req.headers['authorization'];
      if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({success:false,message:"Authorization header missing or malformed"});
      }
        const token=authHeader.split(' ')[1];
        let decoded;
        try{
            decoded=jwt.verify(token,process.env.JWT_SECRET);
        }
        catch(err){
            return res.status(401).json({success:false,message:"Invalid or expired token"});
        }
        const user=await User.findById(decoded.id);
        if(!user){
            return res.status(404).json({success:false,message:"User not found"});
        }
        user.token=null;
        user.isvarified=true;
        await user.save();
        res.status(200).json({success:true,message:"Email verified successfully"});
   } 
    catch(err){
        res.status(500).json({success:false,message:"Internal server error"});
    }
}
exports.postLogin=async(req,res)=>{
    try{
       const{email,password}=req.body;
    if(!email || !password){
        return res.status(400).json({success:false,message:"All fields are required"});
    }
    const user=await User.findOne({email});
    if(!user){
        return res.status(404).json({success:false,message:"User not found"});
    }
    const isPasswordValid=bcrypt.compareSync(password,user.password);
    if(!isPasswordValid){
        return res.status(401).json({success:false,message:"Invalid credentials"});
    }
    if(!user.isvarified){
        return res.status(403).json({success:false,message:"Email not verified"});
    }
    const session=new Sessions({userId:user._id});
    await session.save();
    const accesstoken=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'1h'});
    const refreshtoken=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});
    user.isloggedin=true;
    await user.save();
    res.status(200).json({success:true,message:"Login successful",user,accesstoken,refreshtoken});
    }
    catch(err){
        res.status(500).json({success:false,message:"Internal server error"});
    }
}
exports.postLogout=async(req,res)=>{
 try{
    const sessions=await Sessions.find({userId:req.userId});
    if(sessions.length===0){
        return res.status(400).json({success:false,message:"allready logged out"});
    }
   const userId=req.userId;
   const user=await User.findById(userId);
   if(!user){
    return res.status(404).json({success:false,message:"User not found"});
   }
    user.isloggedin=false;
    await user.save();
    await Sessions.deleteMany({userId:userId});
    res.status(200).json({success:true,message:"Logout successful"});

 }
 catch(err){    
    res.status(500).json({success:false,message:"Internal server error"});
 }
}
exports.forgetPassword=async(req,res)=>{
    // Implementation for forget password
    try{
     const {email}=req.body;
    if(!email){
        return res.status(400).json({success:false,message:"Email is required"});
    }
    const user=await User.findOne({email});
    if(!user){
        return res.status(404).json({success:false,message:"User not found"});
    }
    const otp=Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry=new Date(Date.now()+10*60*1000); // 10 minutes from now
    user.otp=otp;
    user.otpExpiry=otpExpiry;
    await user.save();
    await varifyotp(email,otp);
    res.status(200).json({success:true,message:"OTP sent to email"});
    }
    catch(err){
        return res.status(500).json({success:false,message:"Error sending OTP"});
    }
}
exports.varifyOtp=async(req,res)=>{
    const email=req.params.email;
    const {otp}=req.body;
    const user=await User.findOne({email});
    if(!user){
        return res.status(404).json({success:false,message:"User not found"});
    }   
    if(user.otp!==otp || user.otpExpiry<Date.now()){
        return res.status(400).json({success:false,message:"Invalid or expired OTP"});
    }
    user.otp=null;
    user.otpExpiry=null;
    await user.save();
    res.status(200).json({success:true,message:"OTP verified successfully"});
}
exports.resetPassword=async(req,res)=>{
   try{
    const email=req.params.email;
    const {newpassword,confirmpassword}=req.body;
    if(!newpassword || !confirmpassword){
        return res.status(400).json({success:false,message:"All fields are required"});
    }
    if(newpassword!==confirmpassword){
        return res.status(400).json({success:false,message:"Passwords do not match"});
    }
    const user=await User.findOne({email});
    if(!user){
        return res.status(404).json({success:false,message:"User not found"});
    }
    const hashedPassword=await bcrypt.hash(newpassword,12);
    user.password=hashedPassword;
    await user.save();
    res.status(200).json({success:true,message:"Password reset successfully"});
   }
   catch(err){
    res.status(500).json({success:false,message:"Internal server error"});
   }
}
