let html5QrCode;
let scanning = false;

const mensaje = document.getElementById("mensaje");

// iniciar scanner
function iniciarScanner() {
    html5QrCode = new Html5Qrcode("reader");

    Html5Qrcode.getCameras().then(devices => {

        if (!devices.length) {
            mensaje.innerHTML = "❌ No hay cámara";
            return;
        }

        scanning = true;

        // PRIMER INTENTO: forzar cámara trasera
        html5QrCode.start(
            { facingMode: "environment" }, // 👈 clave
            {
                fps: 10,
                qrbox: { width: 250, height: 250 }
            },
            onScanSuccess
        ).catch(() => {

            // FALLBACK: buscar cámara trasera manualmente
            let cameraId = devices[0].id;

            for (let i = 0; i < devices.length; i++) {
                const label = devices[i].label.toLowerCase();

                if (
                    label.includes("back") ||
                    label.includes("rear") ||
                    label.includes("environment")
                ) {
                    cameraId = devices[i].id;
                    break;
                }
            }

            html5QrCode.start(
                cameraId,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                onScanSuccess
            );
        });

    }).catch(err => {
        mensaje.innerHTML = "❌ Error cámara: " + err;
        console.error(err);
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
                    <div class="ok">
                    ✅ ACCESO PERMITIDO<br><br>
                    👤 ${data.nombre}<br>
                    🚗 ${data.vehiculo}<br>
                    🔢 ${data.placa}
                    </div>
                `;
            } else {
                mensaje.innerHTML = `
                    <div class="error">
                    ❌ ACCESO DENEGADO<br>
                    ${data.motivo ?? ""}
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
    mensaje.innerHTML = "📷 Escaneando...";
    iniciarScanner();
}

// iniciar al cargar
iniciarScanner();