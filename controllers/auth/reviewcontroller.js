import expressAsyncHandlerx from "express-async-handler";

export const rating = expressAsyncHandler( async(req, res) => {
    const {_id} = req.user;
    try {
        const { star, prodId} = req.body;
        const product = await product.findById(prodId);
        
        let alreadyreviewed = product.ratings.find(
            (userId) => userId.postedby.toString() === _id.toString()
        );
        if (alreadyreviewed) {
          

            const updatedReview = await product.updateOne(
                {
                rating: { $eleMatch: alreadyreviewed},
            },
            {
                new: true,
            },
            {
                $set :{"ratings.$.star": star}
            },

            );
            res.json(updatedReview);
            


        } else {
            const reviewProduct = await product.findByIdAndUpdate(
                prodId,
                {
                    $push: {
                        rating: {
                            star: star,
                            postedby: _id,
                        },
                    },
            },
        {
            new: true,
        });
        res.json(reviewProduct);
        }
        
    } catch (error) {
        res.status(400)
    }

});