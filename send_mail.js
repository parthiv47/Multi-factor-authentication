const nodemailer = require('nodemailer');
const send_mail=(email,otp)=>{

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'tester31190@gmail.com', 
    
      pass: 'ehjo azwp qojm uiuc', 
    },
  });

  const mailOptions = {
    from: 'tester31190@gmail.com', 
    to: email,
    subject: 'OTP Verification',
    text: `Your OTP is: ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {     
      return res.status(500).send("error occur");;
    }
    
  });

}
module.exports={send_mail};

