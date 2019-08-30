const express = require('express');
const jwt = require('jsonwebtoken');

const { verifyToken } = require('./middlewares');
const { Domain, User, Post, Hashtag} = require('../models');

const router = express.Router();

router.post('/token', async (req, res) => {
    const { clientSecret } = req.body;
    /*
        API 서버의 응답 형식은 하나로 통일해주는 게 좋다. 
        (JSON 등) 또한 에러 코드를 고유하게 지정해 에러가 뭔지 
        쉽게 알 수 있게 한다. 
    */
    try {
        const domain = await Domain.findOne({
            where: { clientSecret },
            include: [{
                model: User,
                attribute: ['nick', 'id'],
            }]
        });
        if (!domain) {
            return res.status(401).json({
                code: 401,
                message: "등록되지 않은 도메인입니다. 먼저 도메인을 등록하세요."
            })
        }
        const token = await jwt.sign({
            id: domain.user.id,
            nick: domain.user.nick,
        }, process.env.JWT_SECRET, {
                // 유효 시간
                expiresIn: '1m',
                // 발급자 
                issuer: 'GoFlight',
            });
        return res.json({
            code: 200,
            message: '토큰이 발급되었습니다.',
            token,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: error.message
        });
        
    }
});

router.get('/test', verifyToken, (req, res) => {
    res.json(req.decoded);
});

router.get('/posts/my', verifyToken, (req, res) => {
    Post.findAll({ where: { userId: req.decoded.id } })
        .then((posts) => {
            console.log(posts);
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

router.get('/posts/hashtag/:title', verifyToken, async(req, res)=>{
    try {
        const hashtag = await Hashtag.findOne({where : {title : req.params.title}});
        if(!hashtag){
            return res.status(404).json({
                code: 404,
                message: '검색 결과가 없습니다.',
            });
        }
        const posts = await hashtag.getPosts();
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
})
module.exports = router;