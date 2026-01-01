const mongoose=require('mongoose');
const userSchema=new mongoose.Schema({
    username:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    isvarified:{type:Boolean,default:false},
    token:{type:String,default:null},
    isloggedin:{type:Boolean,default:false},
    otp:{type:String,default:null},
    otpExpiry:{type:Date,default:null},
    mytasks:[{type:mongoose.Schema.Types.ObjectId,ref:'Todo'}]
},{timestamps:true});
const User=mongoose.model('User',userSchema);
module.exports=User;