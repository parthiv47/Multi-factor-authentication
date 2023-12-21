const otp_generate=()=>{
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp;
};
module.exports={otp_generate};