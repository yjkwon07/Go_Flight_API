const express = require('express');
const axios = require('axios');

const router = express.Router();
const URL = 'http://localhost:8002/v1';

const request = async (req, api) => {
    try {
        if (!req.session.jwt) { 
            const tokenResult = await axios.post(`${URL}/token`, {
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
        const result = await request(req, '/Go_Flight_API/posts/id');
        res.json(result.data);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get('/posts/all', async (req, res, next) => {
    try {
        const result = await request(req, '/Go_Flight_API/posts/all');
        res.json(result.data);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get('/posts/:count', async (req, res, next) => {
    try {
        const count = req.params.count;
        const result = await request(req, `/Go_Flight_API/posts/${count}`);
        return res.json(result.data);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get('/search/:hashtag', async (req, res, next) => {
    try {
        const result = await request(
            req, `/posts/hashtag/${encodeURIComponent(req.params.hashtag)}`,
        );
        res.json(result.data);
    } catch (error) {
        if(error.code) {
            console.error(error);
            next(error);
        }
    }
})

module.exports = router;