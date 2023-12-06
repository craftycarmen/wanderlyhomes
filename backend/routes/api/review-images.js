const express = require('express');
const { Image, Review } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');

const router = express.Router();

router.delete('/:imageId', requireAuth, async (req, res) => {
    const imageId = req.params.imageId;
    const reviewImage = await Image.unscoped().findByPk(imageId, {
        include: {
            model: Review,
            attributes: ['userId']
        }
    });

    if (!reviewImage || reviewImage.imageableType !== 'Review') return res.status(404).json({ message: "Review Image couldn't be found" });

    if (req.user.id !== reviewImage.Review.userId) {
        return res.status(403).json({ message: 'Forbidden' });
    };

    await reviewImage.destroy();

    return res.json({ message: "Successfully deleted" });

});

module.exports = router;
