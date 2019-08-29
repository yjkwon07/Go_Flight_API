const express = require('express');
const uuidv4 = require('uuid/v4');
const router = express.Router();
const { User , Post, Domain } = require('../models');

router.get('/', (req, res, next) => {
    User.findOne({
        where: {id: req.user && req.user.id || null},
        include: { model: Domain },
    })
        .then((user) => {
            res.render('login', {
                user, 
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