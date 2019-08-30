const express = require('express');
const uuidv4 = require('uuid/v4'); // v1 혹은 v4를 많이 사용한다.
const router = express.Router();
const { User, Domain } = require('../models');

router.get('/', (req, res, next) => {
    User.findOne({
        where: {id: req.user && req.user.id || null},
        include: { model: Domain },
    })
        .then((user) => {
            res.render('login', {
                user, 
                title:'main - GoFlight',
                loginError: req.flash('loginError'),
                domains: user && user.domains,
            })
        })
        .catch((error) => {
            console.error(error);
            next(error);
        })
});

/*
    도메인 주소는 프론트 요청 시, 클라이언트 시크릿은 서버 요청 시 검사한다.
*/
router.post('/domain', (req, res, next) => {
    Domain.create({
        userId: req.user.id,
        host: req.body.host,
        type: req.body.type,
        clientSecret: uuidv4(),
    })
        .then(()=>{
            res.redirect('/');
        })
        .catch((error) => {
            console.error(error);
            next(error);
        })
});

module.exports = router;