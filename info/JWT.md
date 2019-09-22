# JWT
JWT는 프론트나 서버 둘 다에서 __`인증 용도로`__ 사용가능하다.

JWT_SECRET(.env 파일에서)은 JWT 토큰 발급 및 인증에 사용되므로 잘 보관해야한다. 

API 서버의 응답 형식은 하나로 통일해주는게 좋다. __`(JSON 등)`__ 

__또한 에러 코드를 고유하게 지정해 에러가 뭔지 쉽게 알 수 있게 한다.__

    jwt.verify(토큰, JWT시크릿)

유효하지 않을때나(내가 만든 토큰이 아닐 때), 토큰 유효 기간이 만료되었을 때 에러가 발생된다.

```javascript
exports.verifyToken = (req, res, next) => {
    try {
        req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(419).json({
                code: 419,
                message: '토큰이 만료되었습니다.'
            });
        }
        return res.status(401).json({
            code: 401,
            message: '유효하지 않은 토큰입니다.'
        });
    }
};
```

JWT 토큰 내용은 다 보이므로 __민감한 내용은 저장하지 않는다.__

__대신 변조할 수 없으므로 믿고 사용해도 된다.__

```javascript
router.post('/create', async (req, res) => {
    const { frontSecret } = req.body;
    try {
        const domain = await Domain.findOne({
            where: { frontSecret },
            include: [{
                model: User,
                attribute: ['id', 'nick'],
                as: 'User',
            }],
        });
        if (!domain) {
            return res.status(401).json({
                code: 401,
                message: '등록되지 않은 도메인 입니다. 먼저 도메인을 등록하세요.',
            });
        }
        else {
            // JWT 토큰 내용은 다 보이므로 민감한 내용은 저장하지 않는다.
            // 대신 변조할 수 없으므로 믿고 사용해도 된다.
            const token = await jwt.sign({
                id: domain.User.id,
                nick: domain.User.nick,
            }, process.env.JWT_SECRET, {
                expiresIn: '1m',
                issuer: 'GoFlight',
            });
            return res.json({
                code: 200,
                message: "토큰이 발급되었습니다.",
                token,
            });
        }
    } catch (error) {
        console.error(error);
        res.json({
            code: 500,
            message: error.message,
        });
    }
});
```

## Q: session으로 하는것과 jwt로 하는것의 명확한 차이를 잘 모르겠어요. 🤔🤔🤔🤔
각각 사용되어지는 상황이 다른건가요?  

그리고 jwt토큰은 변조는 불가능 하지만 내용이 다 보이는데 로그인 할때 jwt를 사용에도 보안적으로 문제가 없는건가요?

## A: jwt는 보통 디비 접근을 하지 않으려고 씁니다. 😄😄😄😄
세션의 경우는 디비를 조회해서 유저 데이터 정보를 받아와야하지만, jwt는 그 안에 유저 정보가 들어있어서 DB에 부담이 덜합니다. 

대신에 정보가 공개되기 때문에 민감한 내용은 쓰지 말아야겠죠. 

그리고 탈취당할 경우 좀 문제가 커집니다.

대부분의 경우는 세션이 적합하고 편하다고 생각하시면 됩니다.