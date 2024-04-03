const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
require('dotenv').config();

const router = express.Router();

const transporter = nodemailer.createTransport({
    service:'gmail',
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "nasirnabeel36@@gmail.com",
        pass: "jzvt vuht yspe rzwo",
    },
  });

// Signup Route
router.post('/signup', async (req, res) => {
    try {
        const { email, password, fullName } = req.body;
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).send('User already exists');
        }

        const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });
        const otp_expiry = new Date(Date.now() + 300000);

        user = new User({ email, password, otp, otp_expiry, fullName, verified: false });
        await user.save();

        // Send OTP to user's email
        const mailOptions = {
            from: process.env.EMAIL,
            to: user.email,
            subject: 'Verify your email',
            text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return res.status(500).send('Error sending email');
            }
            console.log('Email sent: ' + info.response);
            res.status(200).send('OTP sent to your email');
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Verify OTP Route
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send('User not found');
        }

        const current = new Date();
        if (current > user.otp_expiry) {
            return res.status(400).send('OTP expired');
        }

        if (user.otp !== otp) {
            return res.status(400).send('Invalid OTP');
        }

        // OTP is correct and not expired
        // Here, instead of nulling the OTP fields, mark the user as verified
        user.verified = true;
        user.otp = null;
        user.otp_expiry = null;
        await user.save();

        // You might still issue a JWT here or redirect the user to the login process,
        // depending on your application flow
        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        let user = await User.findOne({ email });

        if (!user || !user.verified) {
            return res.status(400).send('Invalid Credentials or User not verified');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid Credentials');
        }

        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ 
                token,
                user: {
                    fullName: user.fullName,
                    email: user.email
                }
            });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


module.exports = router;
