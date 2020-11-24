const FeedLike = require("@models/feed.like.model")
const FeedComment = require("@models/feed.comment.model")
const FeedSave = require("@models/feed.save.model")
const Feed = require("@models/feeds.model")
const APIError = require('@utils/APIError');

exports.likeUnlike = async(req,res,next)=>{
    try{
        let { feed, customer } = req.locals
        let feedLike = await FeedLike.findOne({feed:feed.id,customer:customer.id})
        if(feedLike){
            feedLike.status = !feedLike.status
            await feedLike.save()
            if(feedLike.status){
                req.body.likeCount = feed.likeCount + 1;
            }else{
                req.body.likeCount = feed.likeCount - 1;
            }
            return next()
        }else{
            feedLike = new FeedLike({
                feed:feed.id,
                customer:customer.id
            })
            await feedLike.save()
            req.body.likeCount = feed.likeCount + 1;
            return next()
        }
    }catch(error){
        return next(new APIError(error))
    }
}

exports.postComment = async(req,res,next)=>{
    try{
        let { feed, customer } = req.locals
        let { comment } = req.body
        feedComment = new FeedComment({
            feed:feed.id,
            customer:customer.id,
            comment
        })
        feedComment = await feedComment.save()
        req.body.commentCount = feed.commentCount + 1;
        req.locals.feedComment = feedComment
        return next()
    }catch(error){
        return next(new APIError(error))
    }
}

exports.getAllLikes = async(req,res,next)=>{
    try{
        let { feed } = req.locals
        req.query.feed = feed
        req.query.status = true
        let feedLikes = await FeedLike.list(req.query)
        feedLikes = feedLikes.feedLikes.map((like)=>{
            if(like.customer)
                return like.customer
        })
        return res.json(feedLikes)
    }catch(error){
        return next(new APIError(error))
    }
}

exports.getAllComments = async(req,res,next)=>{
    try{
        let { feed } = req.locals
        req.query.feed = feed
        req.query.isDeleted = false
        let feedComments = await FeedComment.list(req.query)
        return res.json(feedComments.feedComments)
    }catch(error){
        return next(new APIError(error))
    }
}


exports.getLikeStatus = async(feed,customer)=>{
    try {
        let likeObj =await FeedLike.findOne({feed:feed.id,customer,status:true})
        if(likeObj){
            return true
        }else{
            return false
        }
    } catch (error) {
        throw error
    }
}

exports.getFeedSaveStatus = async(feed,customer)=>{
    try {
        let saveObj =await FeedSave.findOne({feed:feed.id,customer,status:true})
        if(saveObj){
            return true
        }else{
            return false
        }
    } catch (error) {
        throw error
    }
}

exports.saveFeed = async(req,res,next)=>{
    try{
        let { feed, customer } = req.locals
        let feedSave = await FeedSave.findOne({feed:feed.id,customer:customer.id})
        if(feedSave){
            feedSave.status = !feedSave.status
            await feedSave.save()
            return res.json({message:"Success"})
        }else{
            feedSave = new FeedSave({
                feed:feed.id,
                customer:customer.id,
                type:feed.type
            })
            await feedSave.save()
            return res.json({message:"Success"})
        }
    }catch(error){
        return next(new APIError(error))
    }
}

exports.getMyPost =  async(req,res,next)=>{
    try{
        let { entity } = req.session
        req.query.customer = entity
        req.query.type = 'POST'
        let feeds = await Feed.list(req.query)
        req.locals={feeds : feeds}
        await this.setAllFeedLikeAndSaveStatus(req,res,next)
    }
    catch(error){
        return next(new APIError(error))
    }
}

exports.getMyInnovation =  async(req,res,next)=>{
    try{
        let { entity } = req.session
        req.query.customer = entity
        req.query.type = 'INNOVATION'
        let feeds = await Feed.list(req.query)
        req.locals={feeds : feeds}
        await this.setAllFeedLikeAndSaveStatus(req,res,next)
    }
    catch(error){
        return next(new APIError(error))
    }
}


exports.setAllFeedLikeAndSaveStatus = async(req,res,next)=>{
    let { feeds } = req.locals
    let {entity} = req.session
    for(let i=0;i>=0;i++){
        if(feeds.feeds[i]){
            feeds.feeds[i].isLiked = await this.getLikeStatus(feeds.feeds[i],entity)
            feeds.feeds[i].isSave = await this.getFeedSaveStatus(feeds.feeds[i],entity)
        }else{
            return res.json(feeds)
        }
    }
}