const express = require('express');
const bcyrpt = require('bcrypt');
const passport = require('passport');
const { User } = require('../models');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();
// router.get(미들웨어1, 미들웨어2, 미들웨어3); 
// Post/auth/join
router.post('/join', isNotLoggedIn, async (req, res, next) => {
    const { email, nick, password } = req.body;
    try {
        const exUser = await User.findOne({ where: { email } });
        if (exUser) {
            req.flash('joinError', '이미 가입된 이메일 입니다!');
            return res.redirect('/join');
        }
        // console.time('암호화 생성 시간');
        const hash = await bcyrpt.hash(password, 12);
        // console.timeEnd('암호화 생성 시간');
        await User.create({
            email,
            nick : nick === null ? "익명" : nick,
            password: hash,
        });
        return res.redirect('/');
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// POST /auth/login
router.post('/login', isNotLoggedIn, (req, res, next) => { // req.body.email, req.body.password
    // done(에러 ,성공,실패)가 아래로 전달된다. (authErr, user, info)
    passport.authenticate('local', (authError, user, info) => {
        if (authError) {
            console.error(authError);
            return next(authError);
        }
        if (!user) {
            req.flash('loginError', info.message);
            return res.redirect('/');
        }
        return req.login(user, (loginError) => { // req.user // 세션에 저장
            if (loginError) {
                console.error(loginError);
                return next(loginError);
            }
            return res.redirect('/');
        });
    })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙인다.
});

router.get('/logout', isLoggedIn, (req, res) => {
    req.logOut();
    // req.sessiopn.destroy()는 세션을 지운다. (사실 logout시에는 안 해도 된다. 다른 세션도 같이 지워진다.)
    req.session.destroy(); // req.user
    res.redirect('/');
});

// (1)
router.get('/kakao', passport.authenticate('kakao'));

// (2)
router.get('/kakao/callback', passport.authenticate('kakao', {
    failureRedirect: '/',
}), (_req, res) => {
    res.redirect('/');
});

module.exports = router;