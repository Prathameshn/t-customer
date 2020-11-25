const ConnectionRequest = require("@models/connection.request.model")
const APIError = require('@utils/APIError');

exports.getMyRequest = async(req,res,next)=>{
    try {
        let { entity } = req.session
        req.query.from = entity;
        req.query.status = "REQUESTED"
        let allMyRequest =  await ConnectionRequest.list(req.query)
        res.json(allMyRequest)
    }catch(error){
        return next(new APIError(error))
    }
}

exports.getMyRequester = async(req,res,next)=>{
    try {
        let { entity } = req.session
        req.query.to = entity;
        req.query.status = "REQUESTED"
        let allMyRequest =  await ConnectionRequest.list(req.query)
        res.json(allMyRequest)
    }catch(error){
        return next(new APIError(error))
    }
}

exports.checkExist = async(req,res,next)=>{
    try{
        let {to, from } = req.body
        const requestObj = await ConnectionRequest.findOne({to,from})
        req.locals = {requestObj:requestObj}
        return next()
    }catch(error){
        return next(new APIError(error))
    }
}

exports.setBodyForCreateConnection = async(req,res,next)=>{
    try{
        let { entity }= req.session
        req.body.from = entity
        if(req.body.to+"" == entity+""){
            return next(new APIError({message:"Cant send request to self"}))
        }
        return next()
    }catch(error){
        return next(new APIError(error))
    }
}

exports.acceptRequest = async(req,res,next)=>{
    try{
        req.body.status = "ACCEPTED"
        return next()
    }catch(error){
        return next(new APIError(error))
    }
}

exports.rejectRequest = async(req,res,next)=>{
    try{
        req.body.status = "REJECTED"
        return next()
    }catch(error){
        return next(new APIError(error))
    }
}

exports.blockRequest = async(req,res,next)=>{
    try{
        req.body.status = "BLOCKED"
        return next()
    }catch(error){
        return next(new APIError(error))
    }
}

exports.cancelRequest = async(req,res,next)=>{
    try{
        let { entity } = req.session
        const { connectionRequest } = req.locals;
        if(connectionRequest.sender+"" != entity+""){
            return next(new APIError({message:"Cant cancelled, not sent by you"}))
        }
        req.body.status = "CANCELLED"
        return next()
    }catch(error){
        return next(new APIError(error))
    }
}