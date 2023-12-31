const express = require("express");
const router = express.Router();

const {
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrder,
    createOrder,
    updateOrder,
} = require("../controllers/orderController.js");

const {
    authenticateUser,
    authorizePermissions,
} = require("../middleware/authentication.js");

router
    .route("/")
    .post(authenticateUser, createOrder)
    .get([authenticateUser, authorizePermissions("admin")], getAllOrders);
router.route("/showAllMyOrders").get(authenticateUser, getCurrentUserOrder);
router
    .route("/:id")
    .get(authenticateUser, getSingleOrder)
    .patch(authenticateUser, updateOrder);

module.exports = router;
