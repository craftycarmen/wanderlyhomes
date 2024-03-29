const express = require('express');
const { Spot, Review, Image, User, Booking } = require('../../db/models');
const { Op } = require('sequelize');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { requireAuth } = require('../../utils/auth');

const router = express.Router();

const validateSpot = [
    check('address')
        .exists({ checkFalsy: true })
        .withMessage('Street address is required'),
    check('city')
        .exists({ checkFalsy: true })
        .withMessage('City is required'),
    check('state')
        .exists({ checkFalsy: true })
        .withMessage('State is required'),
    check('country')
        .exists({ checkFalsy: true })
        .withMessage('Country is required'),
    check('lat')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage('Latitude is required')
        .bail()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude is not valid'),
    check('lng')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage('Longitude is required')
        .bail()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude is not valid'),
    check('name')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage('Name is required')
        .bail()
        .isLength({ max: 50 })
        .withMessage('Name must be less than 50 characters'),
    check('description')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage('Description is required')
        .bail()
        .isLength({ min: 30 })
        .withMessage('Description needs a minimum of 30 characters'),
    check('price')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage('Price per night is required')
        .bail()
        .isFloat({ min: 0 })
        .withMessage('Price per night must be greater than $0'),
    handleValidationErrors
];

const validateImage = [
    check('url')
        .exists({ checkFalsy: true })
        .optional()
        .custom(async (value, { req }) => {
            const format = value.split('.').pop()
            if (value) {
                if (format !== 'jpg' && format !== 'png' && format !== 'jpeg') {
                    throw new Error('Image URL must end in .png, .jpg, or .jpeg')
                }
            }
        }),
    handleValidationErrors
];

const validateReview = [
    check('review')
        .exists({ checkFalsy: true })
        .notEmpty()
        .withMessage('Review text is required'),
    check('stars')
        .exists({ checkFalsy: true })
        .isInt({ min: 1, max: 5 })
        .withMessage('Stars must be an integer from 1 to 5'),
    handleValidationErrors
];

const validateBooking = [
    check('startDate')
        .exists({ checkFalsy: true })
        .custom(async (value, { req }) => {
            const date = new Date(value);
            const today = new Date();
            if (date < today) {
                throw new Error('startDate cannot be in the past')
            }
        }),
    check('endDate')
        .exists({ checkFalsy: true })
        .custom(async (value, { req }) => {
            const start = new Date(req.body.startDate)
            const end = new Date(value);
            if (end <= start) {
                throw new Error('endDate cannot be on or before startDate')
            }
        }),
    handleValidationErrors
];

const validateQuery = [
    check('page')
        .isInt({ min: 1 })
        .withMessage('Page must be greater than or equal to 1')
        .optional(),
    check('size')
        .isInt({ min: 1 })
        .withMessage('Size must be greater than or equal to 1')
        .optional(),
    check('minLat')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Minimum latitude is invalid')
        .bail()
        .custom(async (min, { req }) => {
            const max = req.query.maxLat;
            if (Number.parseFloat(min) > Number.parseFloat(max)) {
                throw new Error('Minimum latitude cannot be greater than maximum latitude')
            }
        })
        .optional(),
    check('maxLat')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Maximum latitude is invalid')
        .bail()
        .custom(async (max, { req }) => {
            const min = req.query.minLat;
            if (Number.parseFloat(max) < Number.parseFloat(min)) {
                throw new Error('Maximum latitude cannot be less than minimum latitude')
            }
        })
        .optional(),
    check('minLng')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Minimum longitude is invalid')
        .bail()
        .custom(async (min, { req }) => {
            const max = req.query.maxLng;
            if (Number.parseFloat(min) > Number.parseFloat(max)) {
                throw new Error('Minimum longitude cannot be greater than maximum longitude')
            }
        })
        .optional(),
    check('maxLng')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Maximum longitude is invalid')
        .bail()
        .custom(async (max, { req }) => {
            const min = req.query.minLng;
            if (Number.parseFloat(max) < Number.parseFloat(min)) {
                throw new Error('Maximum longitude cannot be less than minimum longitude')
            }
        })
        .optional(),
    check('minPrice')
        .isFloat({ min: 0 })
        .withMessage('Minimum price must be greater than or equal to 0')
        .bail()
        .custom(async (min, { req }) => {
            const max = req.query.maxPrice;
            if (Number.parseFloat(min) > Number.parseFloat(max)) {
                throw new Error('Minimum price cannot be greater than maximum price')
            }
        })
        .optional(),
    check('maxPrice')
        .isFloat({ min: 0 })
        .withMessage('Maximum price must be greater than or equal to 0')
        .bail()
        .custom(async (max, { req }) => {
            const min = req.query.minPrice;
            if (Number.parseFloat(max) < Number.parseFloat(min)) {
                throw new Error('Maximum price cannot be less than minimum price')
            }
        })
        .optional(),
    handleValidationErrors
]

router.get('/', validateQuery, async (req, res) => {
    let { page, size, maxLat, minLat, minLng, maxLng } = req.query
    let minPrice = req.query.minPrice
    let maxPrice = req.query.maxPrice
    const results = {}

    const pagination = {}
    if (page || size) {
        if (page >= 1 && size >= 1) {
            pagination.limit = size;
            pagination.offset = size * (page - 1)
        }

        if (size > 20) size = 20
        if (page > 10) page = 10
    }

    const where = {};
    if (minLat && maxLat) {
        where.lat = {
            [Op.between]: [minLat, maxLat]
        }
    }

    if (minLat && !maxLat) {
        where.lat = {
            [Op.gte]: [minLat]
        }
    }

    if (maxLat && !minLat) {
        where.lat = {
            [Op.lte]: [maxLat]
        }
    }

    if (minLng && maxLng) {
        where.lng = {
            [Op.between]: [minLng, maxLng]
        }
    }

    if (minLng && !maxLng) {
        where.lng = {
            [Op.gte]: [minLng]
        }
    };

    if (maxLng && !minLng) {
        where.lng = {
            [Op.lte]: [maxLng]
        }
    };

    if (minPrice && maxPrice) {
        where.price = {
            [Op.between]: [minPrice, maxPrice]
        }
    }

    if (minPrice && !maxPrice) {
        where.price = {
            [Op.gte]: [minPrice]
        }
    };

    if (maxPrice && !minPrice) {
        where.price = {
            [Op.lte]: [maxPrice]
        }
    };

    const spots = await Spot.findAll({
        include: [
            {
                model: Review
            },
            {
                model: Image
            }
        ],
        where,
        ...pagination
    })

    let spotsList = [];

    spots.forEach(spot => {
        spotsList.push(spot.toJSON());
    });

    spotsList.forEach(spot => {

        spot.lat = Number.parseFloat(spot.lat);
        spot.lng = Number.parseFloat(spot.lng);
        spot.price = Number.parseFloat(spot.price);
        spot.avgRating = 'New';

        spot.Reviews.forEach(review => {

            if (review.stars) {
                let totalStars = spot.Reviews.reduce((sum, review) => (sum + review.stars), 0)
                avgStars = totalStars / spot.Reviews.length
                spot.avgRating = avgStars.toFixed(1);
            }
        });

        spot.previewImage = "No preview images available";

        spot.Images.forEach(image => {
            if (image.preview) {
                spot.previewImage = image.url
            }
        });

        delete spot.Images;
        delete spot.Reviews;
    });

    if (spotsList.length === 0) return res.status(400).json({ message: "No spots found" });

    results.Spots = spotsList
    if (page) results.page = page;
    if (size) results.size = size;


    return res.json(results);
});

router.get('/current', requireAuth, async (req, res) => {
    const { user } = req;

    if (user) {

        const spots = await Spot.findAll({
            include: [
                {
                    model: Review
                },
                {
                    model: Image,
                    attributes: ['url', 'preview']
                }
            ],
            where: {
                ownerId: user.id
            }
        })


        let spotsList = [];

        spots.forEach(spot => {
            spotsList.push(spot.toJSON());
        });

        spotsList.forEach(spot => {

            spot.lat = Number.parseFloat(spot.lat);
            spot.lng = Number.parseFloat(spot.lng);
            spot.price = Number.parseFloat(spot.price);
            spot.avgRating = 'New'

            spot.Reviews.forEach(review => {
                if (review.stars) {
                    let totalStars = spot.Reviews.reduce((sum, review) => (sum + review.stars), 0)
                    avgStars = totalStars / spot.Reviews.length
                    spot.avgRating = avgStars.toFixed(1);
                }
            });

            spot.previewImage = "No preview images available";

            spot.Images.forEach(image => {
                if (image.preview) {
                    spot.previewImage = image.url
                }
            });

            delete spot.Images;
            delete spot.Reviews;
        });

        if (spotsList.length === 0) {
            return res.json({ Spots: "No spots found" })
        } else {
            return res.json({ Spots: spotsList });
        }

    }
});

router.get('/:spotId', async (req, res) => {

    const spot = await Spot.findByPk(req.params.spotId, {
        include: [
            {
                model: Review
            },
            {
                model: Image,
                attributes: ['id', 'url', 'preview']
            },
            {
                model: User,
                attributes: ['id', 'firstName', 'lastName']
            }
        ]
    })

    if (spot) {
        let getSpotById = {};
        let reviews = spot.Reviews;
        let numReviews = reviews.length;

        currSpot = spot.toJSON();

        let totalStars = reviews.reduce((sum, review) => (sum + review.stars), 0);

        if (totalStars) {
            avgStars = (totalStars / reviews.length).toFixed(1);
        } else {
            avgStars = "New"
        }

        getSpotById = {
            id: spot.id,
            ownerId: spot.ownerId,
            address: spot.address,
            city: spot.city,
            state: spot.state,
            country: spot.country,
            lat: Number.parseFloat(spot.lat),
            lng: Number.parseFloat(spot.lng),
            name: spot.name,
            description: spot.description,
            price: Number.parseFloat(spot.price),
            createdAt: spot.createdAt,
            updatedAt: spot.updatedAt,
        }

        getSpotById.numReviews = numReviews;
        getSpotById.avgStarRating = avgStars;

        if (spot.Images.length === 0) {
            getSpotById.SpotImages = "No spot images found"
        } else {
            getSpotById.SpotImages = spot.Images;
        }

        getSpotById.Owner = spot.User;

        return res.json(getSpotById);
    } else {
        return res.status(404).json({
            message: "Spot couldn't be found"
        });
    }
});

router.post('/', requireAuth, validateSpot, async (req, res) => {
    try {
        const { address, city, state, country, lat, lng, name, description, price } = req.body;

        const spot = await Spot.create({
            ownerId: req.user.id,
            address: address,
            city: city,
            state: state,
            country: country,
            lat: Number.parseFloat(lat),
            lng: Number.parseFloat(lng),
            name: name,
            description: description,
            price: Number.parseFloat(price)
        });

        const newSpot = {
            id: spot.id,
            ownerId: spot.ownerId,
            address: spot.address,
            city: spot.city,
            state: spot.state,
            country: spot.country,
            lat: Number.parseFloat(spot.lat),
            lng: Number.parseFloat(spot.lng),
            name: spot.name,
            description: spot.description,
            price: Number.parseFloat(spot.price),
            createdAt: spot.createdAt,
            updatedAt: spot.updatedAt
        }


        return res.status(201).json(newSpot);

    } catch (err) {
        return res.json(err.message);
        // err.message = "Bad Request"
        // err.status = 400
        // next(err)
    }
});

router.post('/:spotId/images', requireAuth, validateImage, async (req, res) => {
    try {
        const spotId = Number(req.params.spotId);
        const spot = await Spot.findByPk(spotId);

        if (!spot) return res.status(404).json({ message: "Spot couldn't be found" });

        if (req.user.id !== spot.ownerId) {
            return res.status(403).json({ message: 'Forbidden' });
        };

        const { url, preview } = req.body;

        const newImage = await Image.create({
            imageableId: spotId,
            imageableType: 'Spot',
            url: url,
            preview: preview
        });

        const image = {};

        image.id = newImage.id;
        image.url = newImage.url;
        image.preview = newImage.preview;

        return res.json(image);
    } catch (err) {
        return res.json(err.message);
    }
});

router.put('/:spotId', requireAuth, validateSpot, async (req, res) => {
    const spotId = Number(req.params.spotId);
    const spot = await Spot.findByPk(spotId);

    if (!spot) return res.status(404).json({ message: "Spot couldn't be found" });

    if (req.user.id !== spot.ownerId) {
        return res.status(403).json({ message: 'Forbidden' })
    };

    const { address, city, state, country, lat, lng, name, description, price } = req.body;

    spot.set({
        address: address,
        city: city,
        state: state,
        country: country,
        lat: Number.parseFloat(lat),
        lng: Number.parseFloat(lng),
        name: name,
        description: description,
        price: Number.parseFloat(price)
    });

    await spot.save();

    return res.json(spot);
});

router.delete('/:spotId', requireAuth, async (req, res) => {
    const spotId = Number(req.params.spotId);
    const spot = await Spot.findByPk(spotId);

    if (!spot) return res.status(404).json({ message: "Spot couldn't be found" });

    if (req.user.id !== spot.ownerId) {
        return res.status(403).json({ message: 'Forbidden' })
    };

    await spot.destroy();

    return res.json({ message: "Successfully deleted" });
});

router.get('/:spotId/reviews', async (req, res) => {
    const spotId = Number(req.params.spotId);
    const spot = await Spot.findByPk(spotId);

    if (!spot) return res.status(404).json({ message: "Spot couldn't be found" });

    const reviews = await Review.findAll({
        where: {
            spotId: spotId
        },
        include: [
            {
                model: User,
                attributes: ['id', 'firstName', 'lastName']
            },
            {
                model: Image,
                as: 'ReviewImages',
                attributes: ['id', 'url']
            }
        ]
    });

    const reviewsList = [];

    reviews.forEach(review => {
        reviewsList.push(review.toJSON());
    });

    reviewsList.forEach(review => {

        if (review.ReviewImages.length === 0)
            review.ReviewImages = "No review images found"
    });

    if (reviewsList.length === 0) {
        return res.json({ Reviews: "No reviews found" })
    } else {
        return res.json({ Reviews: reviewsList });
    }

});

router.post('/:spotId/reviews', requireAuth, validateReview, async (req, res, next) => {
    try {
        const spotId = Number(req.params.spotId);
        const userId = req.user.id;
        const spot = await Spot.findByPk(spotId);

        if (!spot) return res.status(404).json({ message: "Spot couldn't be found" });

        const userReview = await Review.findAll({
            where: {
                userId: userId,
                spotId: spot.id
            }
        })

        if (userReview.length === 0) {
            const { review, stars } = req.body;

            const newReview = await Review.create({
                userId: userId,
                spotId: spotId,
                review: review,
                stars: stars
            })

            const newReviewResults = {
                id: newReview.id,
                userId: newReview.userId,
                spotId: newReview.spotId,
                review: newReview.review,
                stars: newReview.stars,
                createdAt: newReview.createdAt,
                updatedAt: newReview.updatedAt
            }

            return res.status(201).json(newReviewResults);
        } else {
            const err = new Error('User already reviewed');
            err.status = 500;
            err.errors = { reviewed: 'Review already exists for this spot' };
            return next(err)
            // return res.status(500).json({ message: 'User already has a review for this spot' })
        }
    } catch (err) {
        return res.json(err.message);
    }
});

router.get('/:spotId/bookings', requireAuth, async (req, res) => {
    const spotId = Number(req.params.spotId);
    const userId = req.user.id;
    const spot = await Spot.findByPk(spotId);

    if (!spot) return res.status(404).json({ message: "Spot couldn't be found" });

    const bookings = await Booking.findAll({
        where: {
            spotId: spot.id
        },
        include: [
            {
                model: User
            }
        ]
    })

    let bookingsList = [];
    let userBookings = {};

    if (userId === spot.ownerId) {
        bookings.forEach(booking => {
            bookingsList.push(
                userBookings = {
                    User: {
                        id: booking.User.id,
                        firstName: booking.User.firstName,
                        lastName: booking.User.lastName
                    },
                    id: booking.id,
                    spotId: booking.spotId,
                    userId: booking.userId,
                    startDate: booking.startDate,
                    endDate: booking.endDate,
                    createdAt: booking.createdAt,
                    updatedAt: booking.updatedAt
                }
            )
        })
    } else {
        bookings.forEach(booking => {
            bookingsList.push(
                userBookings = {
                    spotId: booking.spotId,
                    startDate: booking.startDate,
                    endDate: booking.endDate
                }
            )
        })
    }

    if (bookingsList.length === 0) {
        return res.json({ Bookings: "No bookings found" })
    } else {
        return res.json({ Bookings: bookingsList });
    }
});

router.post('/:spotId/bookings', requireAuth, validateBooking, async (req, res, next) => {
    const spotId = Number(req.params.spotId);
    const userId = req.user.id;
    const spot = await Spot.findByPk(spotId);

    if (!spot) return res.status(404).json({ message: "Spot couldn't be found" });

    if (userId === spot.ownerId) {
        return res.status(403).json({ message: 'Forbidden' });
    };

    let requestedStartDate = new Date(req.body.startDate);
    let requestedEndDate = new Date(req.body.endDate);
    // let today = new Date();

    // const errors = [];
    // const err = new Error

    // if (requestedStartDate < today) {
    //     err.message = "Bad request";
    //     err.status = 400;
    //     err.errors = { startDate: "startDate cannot be in the past" };
    //     errors.push(err);
    //     return next(err)
    // }

    // if (requestedEndDate <= requestedStartDate) {
    //     err.message = "Bad request";
    //     err.status = 400;
    //     err.errors = { endDate: "endDate cannot be on or before startDate" };
    //     errors.push(err);
    //     return next(err)
    // }

    const existingBookings = await Booking.findAll({
        where: {
            spotId: spotId
        }
    })

    existingBookings.forEach(booking => {

        let bookedStartDate = new Date(booking.startDate);
        let bookedEndDate = new Date(booking.endDate);

        if ((requestedStartDate < bookedStartDate && requestedEndDate > bookedEndDate) ||
            (requestedStartDate >= bookedStartDate && requestedEndDate <= bookedEndDate)) {
            err.message = "Sorry, this spot is already booked for the specified dates";
            err.status = 403;
            err.errors = { startDate: "Start date conflicts with an existing booking", endDate: "End date conflicts with an existing booking" };
            errors.push(err);
            return next(err)
        }

        if (requestedStartDate.getTime() === bookedStartDate.getTime() ||
            requestedStartDate.getTime() === bookedEndDate.getTime() ||
            (requestedStartDate >= bookedStartDate && requestedStartDate <= bookedEndDate)
        ) {
            err.message = "Sorry, this spot is already booked for the specified dates";
            err.status = 403;
            err.errors = { startDate: "Start date conflicts with an existing booking" };
            errors.push(err);
            return next(err)
        }

        if (requestedEndDate.getTime() === bookedStartDate.getTime() ||
            requestedEndDate.getTime() === bookedEndDate.getTime() ||
            (requestedStartDate <= bookedStartDate && requestedEndDate >= bookedStartDate && requestedEndDate <= bookedEndDate) ||
            (requestedStartDate >= bookedEndDate && requestedEndDate <= bookedEndDate)
        ) {
            err.message = "Sorry, this spot is already booked for the specified dates";
            err.status = 403;
            err.errors = { endDate: "End date conflicts with an existing booking" };
            errors.push(err);
            return next(err)
        }
    })

    if (!errors.length) {

        const newBooking = await Booking.create({
            userId: userId,
            spotId: spotId,
            startDate: req.body.startDate,
            endDate: req.body.endDate
        })


        const newBookingResults = {
            id: newBooking.id,
            spotId: newBooking.spotId,
            userId: newBooking.userId,
            startDate: newBooking.startDate,
            endDate: newBooking.endDate,
            createdAt: newBooking.createdAt,
            updatedAt: newBooking.updatedAt
        }
        return res.json(newBookingResults);
    }

});

module.exports = router;
