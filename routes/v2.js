const express = require('express');
const cors = require('cors');
const url = require('url');

const { verifyToken, apiLimiter, premiumApiLimiter } = require('./middlewares');
const { Post, Hashtag, User, Domain} = require('../models');
const router = express.Router();

// router.use(cors());
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

router.use( async (req, res, next) => {
    const domain = await Domain.findOne({
        where: { host : url.parse(req.get('origin')).host }
    });
    if(domain.type === 'free'){
        apiLimiter(req, res, next);
    } else {
        premiumApiLimiter(req, res, next);
    }
});

router.use(verifyToken);

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
            return res.status(500).json({
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
            return res.status(500).json({
                code: 500,
                message: '서버 에러',
            });
        });
});

router.get('/hashtag/search/:title',  async (req, res) => {
    try {
        const hashtag = await Hashtag.findOne({ where: { title: req.params.title } });
        if (!hashtag) {
            return res.status(404).json({
                code: 404,
                message: '검색 결과가 없습니다.',
            });
        }
        const posts = await hashtag.getPost();
        return res.json({
            code: 200,
            payload: posts,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: '서버 에러',
        });
    }
});

router.get('/hashtag/all',  async (_req, res) => {
    try {
        const posts = await Hashtag.findAll()
        .map(hashtag => hashtag.getPost({ attributes: ['id', 'content', 'img'], }));
        return res.json({
            code: 200,
            message: posts[0],
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: '서버에러',
        });
    }
});

router.get('/hashtag/page/:count',  async (req, res) => {
    try {
        const count = req.params.count;
        const hashtag = await Hashtag.findAll();
        if (!hashtag) {
            return res.status(404).json({
                code: 404,
                message: '검색 결과가 없습니다.',
            });
        }
        const posts = await Hashtag.findAll().map(hashtag => hashtag.getPost())
        return res.json({
            code: 200,
            payload: posts[0].slice(0, count),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: '서버 에러',
        });
    }
});

router.get('/follow',  async (req, res) => {
    try {
        const user = await User.findOne({ where: { id: req.decoded.id } });
        const follower = await user.getFollowers({ attributes: ['id', 'nick'] });
        const following = await user.getFollowings({ attributes: ['id', 'nick'] });
        return res.json({
            code: 200,
            follower,
            following,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: '서버 에러',
        });
    }
});

module.exports = router;