function getDollchanAPI() {
    return new Promise((resolve, reject) => {
        const dw = document.defaultView;
        const onmessage = ({ data, ports }) => {
            if (ports && ports.length === 1 && data === 'de-answer-api-message') {
                clearTimeout(to);
                dw.removeEventListener('message', onmessage);
                resolve(ports[0]);
            }
        };
        dw.addEventListener('message', onmessage);
        setTimeout(() => {
            dw.postMessage('de-request-api-message', '*');
        }, 0);
        const to = setTimeout(() => {
            dw.removeEventListener('message', onmessage);
            reject();
        }, 5e3);
    });
}

getDollchanAPI()
    .then(() => {
        captchaLoaded = false;
    });
