# UUID
중복된 비밀키를 막기위해 uuid를사용하여 고유한 값을 만들어 중복을 피한다.

도메인 주소는 프론트 요청시, 서버시크릿은 서버 요청 시 검사합니다.
```javascript
router.post('/domain', (req, res, next) => {
    Domain.create({
        userId: req.user.id,
        host: req.body.host,
        type: req.body.type,
        serverSecret: uuidv4(),
        frontSecret: uuidv4(),
    })
        .then(()=>{
            res.redirect('/');
        })
        .catch((error) => {
            console.error(error);
            next(error);
        })
});
```