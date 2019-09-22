var key = document.querySelector('.js_key').value;
var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function () {
    if (xhr.readyState === xhr.DONE) {
        if (xhr.status === 200) {
            document.querySelector('#result').textContent = xhr.responseText;
        } else {
            console.error(xhr.responseText);
            document.querySelector('#result').textContent = xhr.responseText;
        }
    }
};
xhr.open('POST', 'http://localhost:8002/v2-Go_Flight_API/create');
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(JSON.stringify({frontSecret: key}));