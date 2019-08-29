const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { User } = require('../models');

/*
    참고: https://www.zerocho.com/category/NodeJS/post/57b7101ecfbef617003bf457
    urlencoded 미들웨어가 해석한 req.body의 값들을 usernameField, passwordField에 연결한다.
    usernameField와 passwordField는 어떤 폼(form) 필드로부터 아이디와 비밀번호를 전달받을 지 설정하는 옵션입니다.
*/
module.exports = (passport) => {
    passport.use(new LocalStrategy({
        usernameField: 'email', // req.body.email
        passwordField: 'password', // req.body.password
        // { email: 'yjkwon', password: '1234' } 
        // 이렇게 오면 뒤의 콜백 함수의 email 값이 yjkwon, password 값이 1234 됩니다.
    }, async (email, password, done) => {
        // done(에러 , 성공, 실패)
        // done(null, 사용자 정보)
        // done(null, false, 실패정보)
        try {
            const exUser = await User.findOne({ where: { email } });
            if (exUser) {
                // 비밀번호 검사
                const result = await bcrypt.compare(password, exUser.password);
                if (result) {
                    done(null, exUser);
                } else {
                    done(null, false, { message: '이메일-비밀번호가 일치하지 않습니다.' });
                }
            }
            else {
                done(null, false, { message: '이메일-비밀번호가 일치하지 않습니다.' });
            }
        } catch (error) {
            console.error(error);
            done(error);
        }
    }));
};