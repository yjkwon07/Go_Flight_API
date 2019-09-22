# Rate-limit-call
서버의 요청 횟수를 제한 하여 서버의 과부하도 막을 수 있으며 무료와 유료 사용자의 차등 제한을 줄 수 있다.

    windowMs: 이 시간 동안
    max: 최대 횟수
    delayMs: 요청 간 간격
    handler() 어겼을 경우 메시지

Domains.type의 따라 (free, preimium) 요청 횟수 제한 하기

```javascript
const RateLimit = require('express-rate-limit');

exports.apiLimiter = new RateLimit({
    windowMs: 60 * 1000,
    max: 1,
    delayMs: 0,
    handler(_req, res) {
        res.status(this.statusCode).json({
            code: this.statusCode, //429
            message: '1분에 한 번만 요청할 수 있습니다',
        });
    },
});

exports.premiumApiLimiter = new RateLimit({
    windowMs: 60 * 1000,
    max: 1000,
    delayMs: 0,
    handler(_req, res) {
        res.status(this.statusCode).json({
            code: this.statusCode, //429
            message: '1분에 천 번만 요청할 수 있습니다',
        });
    },
});
```

## 모든 라우터에 적용

router.use로 라우터에 공통되는 미들웨어 한 번에 적용 가능

```javascript
router.use(verifyToken);
```

```javascript
router.use( async (req, res, next) => {
    const domain = await Domain.findOne({
        where: { host : url.parse(req.get('origin')).host }
    });
    if(domain.type === 'free'){
        apiLimiter(req, res, next);
    } else {
        premiumApiLimiter(req, res, next);
    }
});
```
