const KakaoStrategy = require('passport-kakao').Strategy;

const { User } = require('../models');

module.exports = (passport) => {
    // clientID: 카카오 앱 아이디
    // callbackURL: 카카오 리다이렉트 주소

    /*
        1. /auth/kakao
        2. 카카오 로그인
        3. /auth/kakao/callback으로 프로필 반환
    */
    // (2) (3)
    passport.use(new KakaoStrategy({
        clientID: process.env.KAKAO_ID,
        callbackURL: '/auth/kakao/callback',
    }, async (acessToken, refreshToken, profile, done) => {
        /*
            로그인은 카카오가 대신 처리해주지만 디비에 사용자를 저장해준다.
            (snsId, provider 사용)
        */
        try {
            const exUser = await User.findOne({
                where: {
                    snsId: profile.id,
                    provider: 'kakao',
                },
            });
            if (exUser) {
                done(null, exUser);
            } else {
                // console.log(profile);
                const newUser = await User.create({
                    email: profile._json && profile._json.kaccount_email,
                    nick: profile._json.properties.nickname,
                    snsId: profile.id,
                    provider: 'kakao',
                });
                done(null, newUser);
            }
        } catch (error) {
            console.error(error);
            done(error);
        }
    }));
};