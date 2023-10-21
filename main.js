const button = document.getElementById('memorizeButton');
const inputDomain = document.getElementById('inputDomain');
const domain = document.getElementById('domain');
const misskeyUrl = document.getElementById('misskeyUrl');

function siteTransition(qrUrl) {
    const domain = getCookie();
    location.href =
        'https://' +
        domain +
        '/@' +
        qrUrl
            .split('/')
            .find((row) => row.startsWith('@'))
            .split('@')[1] +
        '@' +
        qrUrl
            .split('/@')
            .find((row) => row.startsWith('https://'))
            .split('https://')[1];
}

function getCookie() {
    if (navigator.cookieEnabled) {
        if (document.cookie != '') {
            const cookieValue = document.cookie
                .split('; ')
                .find((row) => row.startsWith('domain'))
                .split('=')[1];
            return cookieValue;
        }
    }
    return null;
}

window.onload = (e) => {
    let video = document.createElement('video');
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    let msg = document.getElementById('msg');

    const userMedia = { video: { facingMode: 'environment' } };
    navigator.mediaDevices.getUserMedia(userMedia).then((stream) => {
        video.srcObject = stream;
        video.setAttribute('playsinline', true);
        video.play();
        startTick();
    });

    function startTick() {
        msg.innerText = 'Loading video...';
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            let img = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let code = jsQR(img.data, img.width, img.height, {
                inversionAttempts: 'dontInvert',
            });
            if (code) {
                if (code.data.startsWith('https://')) {
                    const cookieValue = getCookie();
                    if (cookieValue != null) {
                        siteTransition(code.data);
                        throw qrLoad;
                    } else {
                        msg.innerText = 'ドメインを指定して下さい！';
                    }
                }
            } else {
                msg.innerText = 'Detecting QR-Code...';
            }
        }
        setTimeout(startTick, 100);
    }

    const cookieValue = getCookie();

    if (cookieValue != null) {
        domain.textContent = cookieValue;
        button.value = 'インスタンスを更新';
        misskeyUrl.href =
            'https://' + cookieValue + '/@Kur0den0010@koliosky.com';
    }
};

button.addEventListener('click', domain_store);

function domain_store() {
    if (navigator.cookieEnabled) {
        document.cookie = 'domain=' + encodeURIComponent(inputDomain.value);
        domain.textContent = inputDomain.value;
        misskeyUrl.href =
            'https://' + inputDomain.value + '/@Kur0den0010@koliosky.com';
    }
}
