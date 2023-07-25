const User = require("../models/User.js");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {
    createTokenUser,
    attachCookiesToResponse,
    checkPermissions,
} = require("../utils");

const getAllUsers = async (req, res) => {
    console.log(req.user);

    const users = await User.find({ role: "user" }).select("-password");

    return res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
    const user = await User.findOne({ _id: req.params.id }).select("-password");

    if (!user) {
        throw new CustomError.NotFoundError(
            `User with ID : ${req.params.id} does not exist`
        );
    }

    checkPermissions(req.user, user._id);

    return res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
    res.status(StatusCodes.OK).json({ user: req.user });
};

// Update User with user.save
const updateUser = async (req, res) => {
    const { email, name } = req.body;

    if (!email || !name) {
        throw new CustomError.BadRequestError("Please provide all values");
    }

    const user = await User.findOne({ _id: req.user.userId });

    user.email = email;
    user.name = name;

    // Note that user.save() method will trigger the pre-save hook inside the
    // UserSchema > models/User.js
    await user.save();

    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({ res, user: tokenUser });

    res.status(StatusCodes.OK).json({ user: tokenUser });
};

const updateUserPassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new CustomError.BadRequestError("Please provide both values");
    }

    const user = await User.findOne({ _id: req.user.userId });

    const isPasswordCorrect = await user.comparePassword(oldPassword);

    if (!isPasswordCorrect) {
        throw new CustomError.UnauthenticatedError("Invalid Credentials");
    }

    user.password = newPassword;

    await user.save();

    return res
        .status(StatusCodes.OK)
        .json({ msg: "Success! Password Updated!" });
};

module.exports = {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword,
};

// Update User with findOneAndUpdate
// const updateUser = async (req, res) => {
//     const { email, name } = req.body;

//     if (!email || !name) {
//         throw new CustomError.BadRequestError("Please provide all values");
//     }

//     const user = await User.findOneAndUpdate(
//         { _id: req.user.userId },
//         { email, name },
//         {
//             new: true,
//             runValidators: true,
//         }
//     );

//     const tokenUser = createTokenUser(user);
//     attachCookiesToResponse({ res, user: tokenUser });

//     res.status(StatusCodes.OK).json({ user: tokenUser });
// };
