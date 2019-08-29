const jwt = require('jsonwebtoken');

exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) { // 로그인 여부
        next();
    } else {
        res.status(403).send('로그인 필요');
    }
};

exports.isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/');
    }
};

exports.verifyToken = (req, res, next) => {
    try {
        // jwt.verify(토큰, JWT시크릿)
        // 검증 실패 시 error
        jwt.verify(req.headers.authorization, process.env.JWT_SECRET)
    } catch (error) {
        // 토큰의 유효기간을 짧게 주고 자주 재발급 받는 방식으로 취한다.
        if (error.name === 'TokenExpiredError') {
            return res.status(419).json({
                code: 419,
                message: '토큰이 만료되었습니다.'
            });
        }
        // 위조 토큰 발견시
        return res.status(401).json({
            code: 401,
            message: '유효하지 않은 토큰입니다.'
        });
    }
}