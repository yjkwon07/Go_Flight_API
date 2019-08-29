const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const { User } = require('../models');

// const user={};

/*
    serializeUser은 방금 전에 로그인 성공 시 실행되는 
    done(null, user);에서 user 객체를 전달받아 
    세션(정확히는 req.session.passport.user)에 저장합니다. 
    
    세션이 있어야 페이지 이동 시에도 로그인 정보가 유지될 수 있습니다.
    
    deserializeUser은 실제 서버로 들어오는 요청마다 
    세션 정보(serializeUser에서 저장됨)를 실제 DB의 데이터와 비교합니다. 
    해당하는 유저 정보가 있으면 `done의 두 번째 인자를 req.user에` 저장하고, 
    요청을 처리할 때 `유저의 정보를 req.user를 통해서 `넘겨줍니다. 
    
    serializeUser에서 done으로 넘겨주는 user가 deserializeUser의 첫 번째 매개변수로 전달되기 때문에 
    둘의 타입이 항상 일치해야 합니다. 
    만약 serializeUser에서 id만 넘겨줬다면 deserializeUser의 첫 번째 매개변수도 id를 받아야 하고요. 
    id만 있으면 그 자체로는 req.user을 만들 수 없기 때문에 User.findById(id) 메소드로 
    완전한 user 객체를 만들어서 done을 해주면 됩니다. 
*/
module.exports = (passport) => {
    // req.login 시에 serializeUser호출 -> 유저 정보 중 아이디만 세션에 저장 -> why?
    passport.serializeUser((user, done) => {
        /*
            {id: 12345, name: yjkwon, age: 26 } -> 12345만 저장
            세션에 모두 저장하기는 너무 무겁다.. -> 많은 사용자의 세션값을 담아야 하기 때문에
            그럼 고유값 id만 저장하자 !
        */
        done(null, user.id);
    });
    /*
        deserializeUser는 모든 요청에 실행되기 때문에 DB 조회를 캐싱해서 효율적이게 만들어야 한다.
        메모리에 12345만번만 저장
        매 요청 시마다 app.js의 passport.session()에서 index.js의 `passport.deserializeUser()`가 실행.
        user.id를 DB조회 후 req.user로 저장
    */
    passport.deserializeUser((id, done) => {
        // 12345 -> {id: 1, name: yjkwon, age: 26 }생성 -> req.user [input]
        // 캐싱하는게 좋다.
        // if(user[id]){
        //     done(user[id]);
        // }else {
        //     User.findOne({ where: { id } })
        //         .then(user => user[id] = user, done(null, user))
        //         .catch(err => done(err));
        // }
        User.findOne({
            where: { id },
            include: [{
                model: User,
                attributes: ['id', 'nick'],
                as: "Followers",
            }, {
                model: User,
                attributes: ['id', 'nick'],
                as: 'Followings',
            }],
        })
            .then(user => {
                done(null, user);
            })
            .catch(err => {
                console.error("passport index user error",err);
                done(err)
            });
    });
    local(passport);
    kakao(passport);
};