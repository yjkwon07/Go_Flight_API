# AXIOUS

axios는 다른 서버에 요청을 보내는 간단하고 유용한 라이브러리이다.

axious.메서드(주소, 옵션)

```javascript
axios.defaults.headers.origin = 'http://localhost:8003'; // origin 헤더 추가

const request = async (req, api) => {
    try {
        if (!req.session.jwt) { 
            const tokenResult = await axios.post(`${URL}${VERSION}${TOKEN_URL}`, {
                clientSecret: process.env.SERVER_SECRET,
            });
            if (tokenResult.data && tokenResult.data.code === 200) { 
                req.session.jwt = tokenResult.data.token; 
                console.log("토큰 생성 요청 결과: ", tokenResult.data.message);
            }
            else { 
                return tokenResult.data; 
            }
        }
        return await axios.get(`${URL}${api}`, {
            headers: { authorization: req.session.jwt },
        });
    } catch (error) {
        if (error.response.status === 419) { 
            console.log('토큰 만료');
            delete req.session.jwt;
            return request(req, api);
        } 
        return error.response;
    }
};
```