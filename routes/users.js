const router = require('express').Router();

const User = require('../models/userModel');

// get User Profile
router.get('/profile/:userId', async (req, res) => {
    const { userId } = req.params;
    const userDetails = await User.find({ _id: userId });
    res.status(201).send({
        message: 'Successfully Created Product',
        details: { userDetails }
    });
})


// get User Wallet : GET
router.get('/wallet/:userId', async (req, res) => {
    const { userId } = req.params;
    const userDetails = await User.find({ _id: userId });
    res.status(201).send({
        message: 'Successfully Created Product',
        details: { wallet: userDetails.wallet || 0 }
    });
})


// Update User Wallet After Results : POST
router.post('/wallet/match_fee', async (req, res) => {
    const { userId, amount } = req.body;
    const userDetails = await User.findOne({ _id: userId });
    var oldWallet = userDetails.wallet || 0;

    if (oldWallet == 0) {
        res.send({
            status: 100,
            message: "You havn't enough amount for match"
        })
        return;
    }
    console.log(oldWallet)
    userDetails.wallet = oldWallet - parseInt(amount)
    console.log(userDetails);
    await userDetails.save();

    res.status(201).send({
        status: 1,
        message: 'Successfully Updated the wallet after As Match Fee'
    });
})

// Update User Wallet After Results : POST
router.post('/wallet/win', async (req, res) => {
    const { userId, amount } = req.body;
    const userDetails = await User.findOne({ _id: userId });
    var oldWallet = userDetails.wallet;
    userDetails.wallet = oldWallet + amount / 2
    await userDetails.save();

    res.status(201).send({
        message: 'Successfully Updated the wallet after WIN'
    });
})

// Update User Wallet After Recharge
router.post('/wallet/recharge', async (req, res) => {
    const { userId, amount } = req.body;
    const userDetails = await User.findOne({ _id: userId });
    var oldWallet = userDetails.wallet;
    userDetails.wallet = oldWallet + amount
    await userDetails.save();

    res.status(201).send({
        message: `${amount} Credited Successfully as Recharge`
    });
})





module.exports = router;
