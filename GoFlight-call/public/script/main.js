var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function () {
    if (xhr.readyState === xhr.DONE) {
        if (xhr.status === 200) {
            document.querySelector('#result').textContent = xhr.responseText;
        } else {
            console.error(xhr.responseText);
        }
    }
};
xhr.open('POST', 'http://localhost:8002/v1-token/create');
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(JSON.stringify({ clientSecret: '7d5eee10-30de-46d9-9411-37205f9150c7' }));