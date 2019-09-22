const express = require('express');
const cors = require('cors');
const url = require('url');
const jwt = require('jsonwebtoken');
const sequelize = require("sequelize");

const { verifyToken, apiLimiter, premiumApiLimiter, deprecated } = require('./middlewares');
const { Post, Hashtag, User, Domain } = require('../models');
const router = express.Router();
const Op = sequelize.Op;

router.use(async (req, res, next) => {
    const domain = await Domain.findOne({
        where: { host: url.parse(req.get('origin')).host },
    });
    if (domain) {
        cors({ origin: req.get('origin') })(req, res, next);
    } else {
        next();
    }
});

router.use(async (req, res, next) => {
    const domain = await Domain.findOne({
        where: {
            host: url.parse(req.get('origin')).host,
        }
    });
    if (domain.type === 'free') {
        apiLimiter(req, res, next);
    }
    if (domain.type === 'premium') {
        premiumApiLimiter(req, res, next);
    }
});

router.post('/create', async (req, res) => {
    const { frontSecret, serverSecret } = req.body;
    try {
        const domain = await Domain.findOne({
            where: {
                [Op.or]: [{
                    frontSecret: frontSecret || null
                }, {
                    serverSecret: serverSecret || null
                }]
            },
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
                issuer: 'ykwon07',
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

router.use(verifyToken);

router.get('/test', deprecated, (req, res) => {
    res.json(req.decoded);
});

router.get('/posts/id', async (req, res) => {
    Post.findAll({ where: { userId: req.decoded.id } })
        .then((posts) => {
            res.json({
                code: 200,
                payload: posts,
            });
        })
        .catch((error) => {
            console.error(error);
            return res.status(500).json({
                code: 500,
                message: '서버 에러',
            });
        });
});

router.get('/posts/all', async (_req, res) => {
    Post.findAll()
        .then((posts) => {
            res.json({
                code: 200,
                payload: posts,
            });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({
                code: 500,
                message: '서버 에러',
            });
        });
});

router.get('/posts/page/:count', async (req, res) => {
    const count = req.params.count;
    Post.findAll()
        .then((posts) => {
            res.json({
                code: 200,
                payload: posts.slice(0, count),
            });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({
                code: 500,
                message: '서버 에러',
            });
        });
});

router.get('/hashtag/search/:title', async (req, res) => {
    try {
        const hashtag = await Hashtag.findOne({ where: { title: req.params.title } });
        if (!hashtag) {
            res.status(404).json({
                code: 404,
                message: '검색 결과가 없습니다.',
            });
        }
        const posts = await hashtag.getPost();
        res.json({
            code: 200,
            payload: posts,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            code: 500,
            message: '서버 에러',
        });
    }
});

router.get('/hashtag/all', async (_req, res) => {
    try {
        const posts = await Hashtag.findAll()
            .map(hashtag => hashtag.getPost({ attributes: ['id', 'content', 'img'], }));
        res.json({
            code: 200,
            message: posts[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            code: 500,
            message: '서버에러',
        });
    }
});

router.get('/hashtag/page/:count', async (req, res) => {
    try {
        const count = req.params.count;
        const hashtag = await Hashtag.findAll();
        if (!hashtag) {
            res.status(404).json({
                code: 404,
                message: '검색 결과가 없습니다.',
            });
        }
        const posts = await Hashtag.findAll().map(hashtag => hashtag.getPost())
        res.json({
            code: 200,
            payload: posts[0].slice(0, count),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            code: 500,
            message: '서버 에러',
        });
    }
});

router.get('/follow', async (req, res) => {
    try {
        const user = await User.findOne({ where: { id: req.decoded.id } });
        const follower = await user.getFollowers({ attributes: ['id', 'nick'] });
        const following = await user.getFollowings({ attributes: ['id', 'nick'] });
        res.json({
            code: 200,
            follower,
            following,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            code: 500,
            message: '서버 에러',
        });
    }
});

module.exports = router;