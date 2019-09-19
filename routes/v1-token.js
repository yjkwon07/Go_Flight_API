const express = require('express');
const {verifyToken} = require('./middlewares')
const { Domain, User } = require('../models');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post('/create', async (req, res) => {
    const { clientSecret } = req.body;
    try {
        const domain = await Domain.findOne({
            where: { clientSecret },
            include: [{
                model: User,
                attribute: ['id', 'nick'],
                as: 'User',
            }],
        });
        if (!domain) {
            return res.status(401).json({
                code: 401,
                message: '등록되지 않은 도메인 입니다. 먼저 도메인을 등록하세요.',
            });
        }
        else {
            const token = await jwt.sign({
                id: domain.User.id,
                nick: domain.User.nick,
            }, process.env.JWT_SECRET, {
                expiresIn: '1m',
                issuer: 'GoFlight',
            });
            return res.json({
                code: 200,
                message: "토큰이 발급되었습니다.",
                token,
            });
        }
    } catch (error) {
        console.error(error);
        res.json({
            code: 500,
            message: error.message,
        });
    }
});

router.get('/test', verifyToken, (req, res) => {
    res.json(req.decoded);
});

module.exports = router;