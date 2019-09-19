const express = require('express');
const axios = require('axios');

const router = express.Router();
const URL = 'http://localhost:8002';
const TOKEN_URL= '/v1-token/create'
const VERSION = '/v2-Go_Flight_API';

const request = async (req, api) => {
    try {
        if (!req.session.jwt) { 
            const tokenResult = await axios.post(`${URL}${TOKEN_URL}`, {
                clientSecret: process.env.CLIENT_SECRET,
            });
            if (tokenResult.data && tokenResult.data.code === 200) { 
                req.session.jwt = tokenResult.data.token; 
                console.log("토큰 생성 요청 결과: ", tokenResult.data.message);
            }
            else { 
                return tokenResult.data; 
            }
        }
        return await axios.get(`${URL}${api}`, {
            headers: { authorization: req.session.jwt },
        });
    } catch (error) {
        if (error.response.status === 419) { 
            console.log('토큰 만료');
            delete req.session.jwt;
            return request(req, api);
        } 
        return error.response;
    }
};

router.get('/posts/id', async (req, res, next)=>{
    try {
        const result = await request(req, `${VERSION}/posts/id`);
        res.json(result.data);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get('/posts/all', async (req, res, next) => {
    try {
        const result = await request(req, `${VERSION}/posts/all`);
        res.json(result.data);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get('/posts/page/:count', async (req, res, next) => {
    try {
        const count = req.params.count;
        const result = await request(req, `${VERSION}/posts/page/${count}`);
        return res.json(result.data);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get('/hashtag/all', async (req, res, next) => {
    try {
        const result = await request(
            req, `${VERSION}/hashtag/all`,
        );
        res.json(result.data);
    } catch (error) {
        if(error.code) {
            console.error(error);
            next(error);
        }
    }
});

router.get('/hashtag/search/:hashtag', async (req, res, next) => {
    try {
        const result = await request(
            req, `${VERSION}/hashtag/search/${encodeURIComponent(req.params.hashtag)}`,
        );
        res.json(result.data);
    } catch (error) {
        if(error.code) {
            console.error(error);
            next(error);
        }
    }
});

router.get('/hashtag/page/:count', async (req, res, next) => {
    try {
        const count = req.params.count;
        const result = await request(
            req, `${VERSION}/hashtag/page/${count}`,
        );
        res.json(result.data);
    } catch (error) {
        if(error.code) {
            console.error(error);
            next(error);
        }
    }
});

router.get('/follow', async (req, res, next) => {
    try {
        const result = await request(req, `${VERSION}/follow`);
        res.json(result.data); 
    } catch (error) {
        console.error(error);
        next();
        return res.status(500).json({
            code: 500,
            message: '서버 에러',
        });
    }
});

module.exports = router;