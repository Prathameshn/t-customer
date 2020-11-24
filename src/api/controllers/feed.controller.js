const httpStatus = require('http-status');
const { omit } = require('lodash');
const Feed = require("@models/feeds.model")
const APIError = require('@utils/APIError');
const convertor = require('convert-to-thumbnail');
const path = require('path');
const feedService = require("@services/feed.service")


/**
 * Load Feed and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
   try {
      const feed = await Feed.get(id);
      req.locals = { feed };
      return next();
   } catch (error) {
      next(new APIError(error));
   }
};

/**
 * Get feed
 * @public
 */
exports.get = async(req, res) => {
   let { feed } = req.locals
   feed.isLike = await feedService.getLikeStatus(feed,req.session.entity)
   feed.isSave = await feedService.getFeedSaveStatus(feed,req.session.entity)
   res.json(feed)
};

/**
 * Create new feed
 * @public
 */
exports.create = async (req, res, next) => {
   try {
      let { customer } = req.locals
      req.body.customer = customer.id
      const feed = new Feed(req.body);
      const savedFeed = await feed.save();
      res.json(savedFeed.transform())
   } catch (error) {
      next(new APIError(error));
   }
};

/**
 * Replace existing feed
 * @public
 */
exports.replace = async (req, res, next) => {
   try {
      const { feed } = req.locals;
      const newFeedDetails = new Feed(req.body);
      const newFeed = omit(newFeedDetails.toObject(), '_id');

      await feed.updateOne(newFeed, { override: true, upsert: true });
      const savedFeed = await Feed.findById(feed._id);

      res.json(savedFeed.transform());
   } catch (error) {
      next(new APIError(error));
   }
};

/**
 * Update existing feed
 * @public
 */
exports.update = async(req, res, next) => {
   try{
      const updatedFeed = omit(req.body);
      const feed = Object.assign(req.locals.feed, updatedFeed);
      const savedFeed = await feed.save();
      res.json(savedFeed.transform())
   }catch(error){
      next(new APIError(error))
   }
};

/**
 * Get feed list
 * @public
 */
exports.list = async (req, res, next) => {
   try {
      let { entity } = req.session
      let feeds = await Feed.list(req.query);
      for(let i=0;i>=0;i++){
         if(feeds.feeds[i]){
           feeds.feeds[i].isLiked = await feedService.getLikeStatus(feeds.feeds[i],entity)
           feeds.feeds[i].isSave = await feedService.getFeedSaveStatus(feeds.feeds[i],entity)
         }else{
           return res.json(feeds);
         }
       }
   } catch (error) {
      next(new APIError(error));
   }
};

/**
 * Delete feed
 * @public
 */
exports.remove = async(req, res, next) => {
   try{
      const { feed } = req.locals;
      feed.isDeleted = true
      await feed.save()
      res.status(httpStatus.NO_CONTENT).end()
   }catch(error){
      next(new APIError(error));
   }
};

exports.setMedia = async(req, res, next) => {
   try{
      let media;
      let { feed } = req.locals
      if(req.files.length > 0){
         media = req.files
         media = await media.map((ele)=>{
            if(ele.mimetype === "image/jpg"  || 
               ele.mimetype === "image/jpeg"  || 
               ele.mimetype ===  "image/png"
            ){
               ele.compressImageUrl = `/CompressFeed/${ele.filename}`
            }else{
               ele.compressImageUrl =`/Feed/${ele.filename}`
            }
           ele.path = `/Feed/${ele.filename}`;
           return ele
         })
         if(!feed){
            req.body.media = media
         }else{
            req.body.media = feed.media.concat(media)
         }
         next()
      }else{
         next()
      }
   }catch(error){
      next(new APIError(error));
   }
};


exports.compressImage = async (req, res, next) => {
   try {
       let fileSorcePath, fileDestPath
       if(req.files.length > 0){
          req.files.forEach(async(file)=>{
             if (file) {
               if(file.mimetype === "image/jpg"  || 
               file.mimetype === "image/jpeg"  || 
               file.mimetype ===  "image/png"
               ){
                  fileDestPath = path.join(__dirname,`../../../public/CompressFeed/${file.filename}`)
                  fileSorcePath = path.join(__dirname,`../../../public/Feed/${file.filename}`)
                  //   console.log(fileSorcePath)
                  await convertor.convertImageToThumbnail(fileSorcePath, fileDestPath)
               }else{
   
               }
             }
          })
          next()
       }else{
         next()
       }
   } catch (error) {
       next(new APIError({"message":"Error while compresing image"}));
   }
}

/**
 * Update existing feed and responce with feed comment
 * @public
 */
exports.postComment = async(req, res, next) => {
   try{
      let { feedComment } = req.locals
      const updatedFeed = omit(req.body);
      const feed = Object.assign(req.locals.feed, updatedFeed);
      const savedFeed = await feed.save();
      res.json(feedComment)
   }catch(error){
      next(new APIError(error))
   }
};