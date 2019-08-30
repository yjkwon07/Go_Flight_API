const express = require('express');
const axios = require('axios');
/*
    axios는 다른 서버에 요청을 보내는 간단하고 유용한 라이브러리이다.
    axios.메소드(주소,옵션)
*/
const router = express.Router();
const URL = 'http://localhost:8002/v1';

const request = async (req, api) => {
    try {
        console.log("토큰 세션 확인:", req.session.jwt);
        if (!req.session.jwt) { // 세션에 토큰이 없으면
            const tokenResult = await axios.post(`${URL}/token`, {
                clientSecret: process.env.CLIENT_SECRET,
            });
            if (tokenResult.data && tokenResult.data.code === 200) { // 토큰 발급 성공
                req.session.jwt = tokenResult.data.token; // 세션에 토큰 저장
                console.log("토큰 생성 요청 결과: ", tokenResult.data.message);
                console.log(tokenResult.data.token);
            }
            else { // 토큰 발급 실패
                return tokenResult.data; // 발급 실패 사유 응답
            }
        }
        // 발급받은 토큰 API 요청
        return await axios.get(`${URL}${api}`, {
            headers: { authorization: req.session.jwt },
        });
    } catch (error) {
        if (error.response.status === 419) { // 토큰 만료 시 토큰 재발급
            console.log('토큰 만료');
            delete req.session.jwt;
            return request(req, api);
        } // 419 외의 다른 에러면
        return error.response;
    }
};

router.get('/mypost', async (req, res, next)=>{
    try {
        const result = await request(req, '/posts/my');
        res.json(result.data);
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