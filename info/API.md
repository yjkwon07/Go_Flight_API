# API 
__`Application Programming Interface__`

남이 만든 코드를 사용할 수 있게 해주는 창구 

사용자에게 발급할 시크릿키와 도메인주소를 저장할 Domain 모델을 만듭니다.

```javascript 
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('domain', {
        host: {
            type: DataTypes.STRING(80),
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING(10),
            allowNull: false, 
        },
        serverSecret: {
            type: DataTypes.STRING(40),
            allowNull: false,
        },
        frontSecret: {
            type: DataTypes.STRING(40),
            allowNull: false,
        },
    },
         {
            timestamps: true,
            paranoid: true,
            validate: {
                unknownType() {
                    // type의 값을 체크
                    if (this.type !== 'free' && this.type !== 'premium') {
                      throw new Error('type 컬럼은 free나 premium이어야 합니다.');
                    }
                  },
            }
        });
};
```

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
