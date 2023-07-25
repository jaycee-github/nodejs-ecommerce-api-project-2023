const express = require("express");
const router = express.Router();

const {
    createReview,
    getAllReviews,
    getSingleReview,
    updateReview,
    deleteReview,
} = require("../controllers/reviewController.js");

const { authenticateUser } = require("../middleware/authentication.js");

router.route("/").post(authenticateUser, createReview).get(getAllReviews);
router
    .route("/:id")
    .get(getSingleReview)
    .patch(authenticateUser, updateReview)
    .delete(authenticateUser, deleteReview);

module.exports = router;
