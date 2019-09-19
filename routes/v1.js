const express = require('express');
const { verifyToken } = require('./middlewares');
const { Post, Hashtag, User } = require('../models');

const router = express.Router();

router.get('/posts/id', verifyToken, (req, res) => {
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

router.get('/posts/all', verifyToken, (_req, res) => {
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

router.get('/posts/page/:count', verifyToken, (req, res) => {
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

router.get('/hashtag/search/:title', verifyToken, async (req, res) => {
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

router.get('/hashtag/all', verifyToken, async (_req, res) => {
    try {
        const posts = await Hashtag.findAll({ attribute: ['id', 'content', 'img'], })
        .map(hashtag => hashtag.getPost());
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

router.get('/hashtag/page/:count', verifyToken, async (req, res) => {
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

module.exports = router;