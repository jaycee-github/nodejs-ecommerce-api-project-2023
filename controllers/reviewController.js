const Review = require("../models/Review.js");
const Product = require("../models/Product.js");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const {
    createTokenUser,
    attachCookiesToResponse,
    checkPermissions,
} = require("../utils");

const createReview = async (req, res) => {
    const { product: productId } = req.body;

    const isValidProduct = await Product.findOne({ _id: productId });

    if (!isValidProduct) {
        throw new CustomError.NotFoundError(
            `No product with ID : ${productId}`
        );
    }

    const alreadySubmitted = await Review.findOne({
        product: productId,
        user: req.user.userId,
    });

    if (alreadySubmitted) {
        throw new CustomError.BadRequestError(
            "Already submitted review for this product"
        );
    }

    req.body.user = req.user.userId;

    const review = await Review.create(req.body);

    res.status(StatusCodes.CREATED).json({ review });
};

const getAllReviews = async (req, res) => {
    const reviews = await Review.find({})
        .populate({
            path: "product",
            select: "name company price",
        })
        .populate({
            path: "user",
            select: "name",
        });

    res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

const getSingleReview = async (req, res) => {
    const { id: reviewId } = req.params;

    const review = await Review.findOne({ _id: reviewId });

    if (!review) {
        throw new CustomError.NotFoundError(`No review with ID : ${reviewId}`);
    }

    res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res) => {
    const { id: reviewId } = req.params;
    const { rating, title, comment } = req.body;

    const review = await Review.findOne({ _id: reviewId });

    if (!review) {
        throw new CustomError.NotFoundError(`No review with ID : ${reviewId}`);
    }

    if (!rating || !title || !comment) {
        throw new CustomError.BadRequestError(
            "Please provide rating, title, and comment"
        );
    }

    checkPermissions(req.user, review.user);

    review.rating = rating;
    review.title = title;
    review.comment = comment;

    await review.save();

    return res.status(StatusCodes.OK).json({ review });
};

const deleteReview = async (req, res) => {
    const { id: reviewId } = req.params;

    const review = await Review.findOne({ _id: reviewId });

    // console.log(review);

    if (!review) {
        throw new CustomError.NotFoundError(`No review ID with : ${reviewId}`);
    }

    checkPermissions(req.user, review.user);

    await review.remove();

    return res.status(StatusCodes.OK).json({ msg: "Success! Review Deleted!" });
};

const getSingleProductReviews = async (req, res) => {
    const { id: productId } = req.params;

    const reviews = await Review.find({ product: productId });

    return res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

module.exports = {
    createReview,
    getAllReviews,
    getSingleReview,
    updateReview,
    deleteReview,
    getSingleProductReviews,
};
