const mongoose=require('mongoose')
mongoose.connect("mongodb://localhost:27017/Authentication").then(()=>{
  console.log("connect to mongoDB successfully")
}).catch(()=>{
  console.log(err)
})

const user =mongoose.Schema({
 // email:String,
 // password:String,
 email:{
    type:String,
    required:true
 },
 password:{
    type:String,
    required:true
 },
 otp:{
  type:String

 }
},{ strict: false })
const User=mongoose.model("User",user);
module.exports=User;

