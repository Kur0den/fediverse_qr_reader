const button = document.getElementById('memorizeButton');
const inputDomain = document.getElementById('inputDomain');
const domain = document.getElementById('domain');

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
                drawRect(code.location); // Rect
                msg.innerText = code.data; // Data
                if (code.data.startsWith('https://')) {
                    console.log(true);
                    location.href = code.data;
                }
            } else {
                msg.innerText = 'Detecting QR-Code...';
            }
        }
        setTimeout(startTick, 100);
    }

    function drawRect(location) {
        drawLine(location.topLeftCorner, location.topRightCorner);
        drawLine(location.topRightCorner, location.bottomRightCorner);
        drawLine(location.bottomRightCorner, location.bottomLeftCorner);
        drawLine(location.bottomLeftCorner, location.topLeftCorner);
    }

    function drawLine(begin, end) {
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#FF3B58';
        ctx.beginPath();
        ctx.moveTo(begin.x, begin.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    }

    if (navigator.cookieEnabled) {
        console.log(typeof document.cookie);
        if (document.cookie != '') {
            const cookieValue = document.cookie
                .split('; ')
                .find((row) => row.startsWith('domain'))
                .split('=')[1];
            domain.textContent = cookieValue;
            button.value = 'インスタンスを更新';
        }
    }
};

button.addEventListener('click', domain_store);

function load(_url) {
    var xhr;
    xhr = new XMLHttpRequest();
    xhr.open('HEAD', _url, false);
    xhr.send(null);
    return xhr.status;
}

function domain_store() {
    if (navigator.cookieEnabled) {
        if (load(inputDomain.value + '/manifest.json') == 200) {
            document.cookie = 'domain=' + encodeURIComponent(inputDomain.value);
            domain.textContent = inputDomain.value;
        }
    }
}
