const ob = {
  otp : 0,
  email:"",
  password:""
}

const express= require("express");
const nodemailer = require('nodemailer');
const path=require('path')
const bodyParser=require('body-parser')
//const jwt=require('jsonwebtoken');
const app=express();
const port=3000;
const User=require('./mongodb')
const templatePath=path.join(__dirname,'../templates')
const SECRET_KEY="NOTESAPI"
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.json())
app.set("view engine","ejs")
//app.set("views",templatePath)
//email handling...


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
          
          // res.render('index',{suggest:"User all ready exist"})
          
          // res.render('index.ejs',{suggest:"User all ready exist"})
           res.redirect("/?suggest=User all ready exist");
        
        }else{
          console.log("2..")
        

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'hetdoshi2020@gmail.com', 
              pass: 'dzat pneg qhvt ucrp', 
            },
          });
        
          const mailOptions = {
            from: 'hetdoshi2020@gmail.com', 
            to: userEmail,
            subject: 'OTP Verification',
            text: `Your OTP is: ${otp}`,
          };
        
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log(error)
              return res.status(500).send("error occur");
            }
            ob.otp = otp
            ob.email = userEmail
            ob.password = userPassword
            res.status(200).render('verify_otp',{otp1:"otp send successfully ",email:userEmail,redirect:"/signup/dashboard"});
            
           // res.status(200).redirect(`/request_otp/?otp1:otp send successfully ,email:${email}`)
          });
       // const token=jwt.sign({email :result.email,id:result._id},SECRET_KEY);
      //  res.status(201).json({user:result,token:token})
       //res.redirect("/request_otp")
      

      }
    }
    catch(error)
    {
      console.log(error);
     // res.status(404).json({user:result,token:token})
     res.status(404).send("<h1>Error occur</h1>")
    }  
})
app.post("/login",async (req,res)=>{
  const email=req.body.email;
    const userPassword=req.body.password;
    console.log(userPassword , email);

    try{
      const validemail= await User.findOne({email :email})
      if(validemail)
      {
        if(validemail.password ==userPassword)
        {
          const otp = Math.floor(100000 + Math.random() * 900000).toString();

          await User.findOneAndUpdate({ email }, { otp }, { upsert: true });
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'hetdoshi2020@gmail.com', 
              pass: 'dzat pneg qhvt ucrp', 
            },
          });
        
          const mailOptions = {
            from: 'hetdoshi2020@gmail.com', 
            to: email,
            subject: 'OTP Verification',
            text: `Your OTP is: ${otp}`,
          };
        
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log(error)
              return res.status(500).send("error occur");
            }
            res.status(200).render('verify_otp',{otp1:"otp send successfully ",email:email,redirect:"/login/dashboard"});
           // res.status(200).redirect(`/request_otp/?otp1:otp send successfully ,email:${email}`)
          });



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
      console.log(error);
     // res.status(404).json({user:result,token:token})
     res.status(404).send("<h1>Error occur</h1>")
    }
   

})
app.post('/login/dashboard',async(req,res)=>{
  let otp=req.body.otp;

  let email=req.body.email;
  
  const user = await User.findOne({ email, otp });
  if (user) {
    // Clear the OTP in the database after successful verification
    console.log("1.....")
    await User.updateOne({ email }, { $unset: { otp: 1 } });
    res.status(200).sendFile(path.join(__dirname+"/views/dashboard.html"));
  } else {
   console.log("1.....")
    res.status(400).render('verify_otp',{otp1:"Invalid otp",email:email});
  }
  // res.sendFile(path.join(__dirname+"/views/verify_otp.html"));
 
 
 
})
app.post('/signup/dashboard',async(req,res)=>{
  let otp=req.body.otp;
 let email=req.body.email;
 if(otp == ob.otp && email ==ob.email){

  const user = await User.create({
    email:email,
    password:ob.password,
  })
  user.save();
  res.status(200).sendFile(path.join(__dirname+"/views/dashboard.html"));

 }
 else{
  res.status(400).render('verify_otp',{otp1:"Invalid otp",email:email});
 }

 
})



app.listen(port,()=>{
    console.log(`server listen on ${port} number `)
})