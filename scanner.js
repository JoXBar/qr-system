let html5QrCode;
let scanning = false;

const mensaje = document.getElementById("mensaje");

// iniciar scanner
function iniciarScanner() {

    if (scanning) return;

    html5QrCode = new Html5Qrcode("reader");

    Html5Qrcode.getCameras().then(devices => {

        if (!devices.length) {
            mensaje.innerHTML = "No hay cámara";
            return;
        }

        scanning = true;
        mensaje.innerHTML = "Escaneando...";

        html5QrCode.start(
            { facingMode: "environment" },
            {
                fps: 10,
                qrbox: { width: 250, height: 250 }
            },
            onScanSuccess
        );

    }).catch(err => {
        mensaje.innerHTML = "Error cámara: " + err;
    });
}

// cuando detecta QR
function onScanSuccess(decodedText) {

    if (!scanning) return;

    scanning = false;

    // DETENER ESCÁNER
    html5QrCode.stop().then(() => {

        mensaje.innerHTML = "🔍 Código: " + decodedText;

        fetch("/qr-system/api/validar.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ codigo: decodedText })
        })
        .then(res => res.json())
        .then(data => {

            if (data.valido) {
    mensaje.innerHTML = `
        <div class="result-card ok">
            <div class="title">ACCESO PERMITIDO</div>
            <div class="line">${data.nombre}</div>
            <div class="line">${data.vehiculo}</div>
            <div class="line">${data.placa}</div>
        </div>
    `;
} else {
    mensaje.innerHTML = `
        <div class="result-card error">
            <div class="title">ACCESO DENEGADO</div>
            <div class="line">${data.motivo ?? ""}</div>
        </div>
    `;
}

            // botón para siguiente escaneo
            mensaje.innerHTML += `
                <br><br>
                <button onclick="reiniciarScanner()">Escanear otro</button>
            `;

        });

    });
}

// reiniciar scanner
function reiniciarScanner() {
    mensaje.innerHTML = "Escaneando...";
    iniciarScanner();
}

function detenerScanner() {
    if (html5QrCode && scanning) {
        html5QrCode.stop().then(() => {
            scanning = false;
            mensaje.innerHTML = "Escaneo detenido";
        });
    }
}