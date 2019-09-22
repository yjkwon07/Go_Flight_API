# CORS(cross origin resource sharing)

__프론트에서 다른 origin의 서버로 요청을 보내면 에러 발생__

이유: 

    CORS 요청 시에는 OPTIONS 메서드 요청이 간다.

    Acess-Control-Allow-Origin을 검사한다.

    검사에서 해당 origin을 받아 주지 않으면 서버에서 요청을 거절한다.

## 해결1) 프록시 요청

front -> origin: server (Interceptor) -> other: server

## 해결 2) cors 

Acess-Control-Allow-Origin __헤더를 응답 헤더에 넣어주면 된다.__

```javascript
router.use(cors());
```

## 미들웨어 안에 미들웨어를 넣어 커스터마이징을 할 수 있다 

이유: 

    요청 도메인을 제한하기 위해 

```javascript
router.use(async (req, res, next) => {
    const domain = await Domain.findOne({
        where: { host: url.parse(req.get('origin')).host },
    });
    if (domain) {
        cors({ origin: req.get('origin') })(req, res, next);
    } else {
        next();
    }
});
```