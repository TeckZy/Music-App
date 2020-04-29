module.export   =  (socket,err)=>{
    if (err) return res.status(400).json({"Error" : true, "Message" : "Socket Connection Failed"})


}