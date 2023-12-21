const express= require("express");
const nodemailer = require('nodemailer');
const path=require('path')
const bodyParser=require('body-parser')
const app=express();
const port=3000;
const User=require('./mongodb')
const otp1=require('./otp_generate')
const mail=require('./send_mail')
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.json())
app.set("view engine","ejs")
const ob = {
  otp : 0,
  email:"",
  password:""
}


app.get("/",(req,res)=>{
  // res.sendFile(path.join(__dirname+"/templates/index.html"));
  let suggest1=req.query.suggest;
  res.render('index',{suggest:suggest1})
})

app.post("/sign-up", async (req,res)=>{
   
    const userEmail=req.body.email;
    const userPassword=req.body.password;
    try{
        const existingUser= await User.findOne({email :userEmail})
        if(existingUser)
        {
           res.redirect("/?suggest=User all ready exist");

        }else{
          const otp= otp1.otp_generate();
          mail.send_mail(userEmail,otp);

            ob.otp = otp
            ob.email = userEmail
            ob.password = userPassword
            console.log("3...")
            res.render('verify_otp',{otp1:"otp send successfully ",email:userEmail,redirect:"/signup/dashboard"});
         
      }
    }
    catch(error)
    {
      console.log(error);
     res.status(404).send("<h1>Error occur</h1>")
    }  
})
app.post("/login",async (req,res)=>{
  const email=req.body.email;
    const userPassword=req.body.password;
    //console.log(userPassword , email);
    try{
      const validemail= await User.findOne({email :email})
      if(validemail)
      {
        if(validemail.password ==userPassword)
        {
          const otp = otp1.otp_generate();
          await User.findOneAndUpdate({ email }, { otp });
          mail.send_mail(email,otp);
          res.status(200).render('verify_otp',{otp1:"otp send successfully ",email:email,redirect:"/login/dashboard"});
        }
        else{ 
          res.redirect("/?suggest=Invalid  password"); 
        }
      }
      else{
        res.redirect("/?suggest=Invalid email");
      }

    }catch(error)
    {
     res.status(404).send("<h1>Error occur</h1>")
    }
  
})


app.post('/login/dashboard',async(req,res)=>{
  let otp=req.body.otp;

  let email=req.body.email;
  
  const user = await User.findOne({ email, otp });
  if (user) {
    // Clear the OTP in the database after successful verification
   // console.log("1.....")
    await User.updateOne({ email }, { $unset: { otp: 1 } });
    res.status(200).sendFile(path.join(__dirname+"/views/dashboard.html"));
  } else {
 //  console.log("1.....")
    res.status(400).render('verify_otp',{otp1:"Invalid otp",email:email,redirect:"/login/dashboard"});
  }
 
})
app.post('/signup/dashboard',async(req,res)=>{
  let otp=req.body.otp;
 let email=req.body.email;
 console.log("4....")
 if(otp == ob.otp && email ==ob.email){

  const user = await User.create({
    email:email,
    password:ob.password,
  })
  user.save();
  ob.otp=0;
  ob.email="";
  ob.password="";
  
  res.status(200).sendFile(path.join(__dirname+"/views/dashboard.html"));

 }
 else{
  res.status(400).render('verify_otp',{otp1:"Invalid otp",email:email,redirect:"/signup/dashboard"});
 }
})



app.listen(port,()=>{
    console.log(`server listen on ${port} number `)
})