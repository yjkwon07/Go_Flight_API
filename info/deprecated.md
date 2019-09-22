버전이 달라 질 때마다 deprecated를 설정하여 
사용자에게 알림 메시지를 보낸다.

```javascript
exports.deprecated = (_req, res) => {
    res.status(410).json({
        code: 410,
        message: "새로운 버전이 나왔습니다. 새로운 버전을 사용하세요.",
    });
};
```

모든 라우터에 적용할 시 맨 처음 미들웨어에 deprecated를 불러와서 해당 모듈을 사용 불가 하도록 만든다.
```javascript
router.use(deprecated)
```