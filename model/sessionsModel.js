const mongoose=require('mongoose');
const sessionsSchema=new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}
});
const Sessions=mongoose.model('Sessions',sessionsSchema);
module.exports=Sessions;