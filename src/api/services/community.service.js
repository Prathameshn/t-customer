const Community = require("@models/community.model")
const APIError = require('@utils/APIError');

exports.addSenderInReceiverCommunity = async(req,res,next)=>{
    try {
       let {to,from} = req.body
       const receiverCommunity = await Community.findOne({customer:to})
       if(receiverCommunity){
            let updated = await Community.updateOne({customer:to},{ $addToSet: { community : {user:from} } })
            return next()
       }
       else{
        const community = new Community({
            customer:to,
            community:[{user:from}]
        });
        const newcommunity = await community.save();
        next()
       }
    }catch(error){
        return next(new APIError(error))
    }
}


exports.addReceiverInSenderCommunity = async(req,res,next)=>{
    try {
        let {to,from} = req.body
        const receiverCommunity = await Community.findOne({customer:from})
        if(receiverCommunity){
             let updated = await Community.updateOne({customer:from},{ $addToSet: { community : {user:to} } })
             return next()
        }
        else{
         const community = new Community({
             customer:from,
             community:[{user:to}]
         });
         const newcommunity = await community.save();
         next()
        }
     }catch(error){
         return next(new APIError(error))
     }
}