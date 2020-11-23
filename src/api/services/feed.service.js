const FeedLike = require("@models/feed.like.model")
const FeedComment = require("@models/feed.comment.model")
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
            next()
        }else{
            feedLike = new FeedLike({
                feed:feed.id,
                customer:customer.id
            })
            await feedLike.save()
            req.body.likeCount = feed.likeCount + 1;
            next()
        }
    }catch(error){
        next(new APIError(error))
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
        next()
    }catch(error){
        next(new APIError(error))
    }
}