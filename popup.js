var allLinks = [];

function descargarxml() {
    document.getElementById("status").textContent = "Descargando XML...";
    // Verificar que allLinks tiene datos antes de proceder
    if (!allLinks || !allLinks[0] || !allLinks[2] || allLinks[0].length === 0) {
        document.getElementById("status").textContent = "No hay XMLs para descargar";
        return;
    }

    // Hacemos una copia de allLinks
    // luego ejecutamos un intervalo cada 1000 milisegundos para extraer un elemento del array y descargarlo
    // cuando no haya elementos, cancelar el intervalo.
    //los xml están en el array en posición 0
    var urls = allLinks[0];
    var nombres = allLinks[2];
    var interval = setInterval(function () {
        var url = urls.shift();
        var nombre = nombres.shift();
        if (url) {
            //Descargar el archivo
            chrome.downloads.download(
                {
                    url: url,
                    filename: nombre + ".xml",
                },
                function (id) { },
            );
        } else {
            clearInterval(interval);
        }
    }, 1000);
}

function descargarpdf() {
    document.getElementById("status").textContent = "Descargando PDF...";
    // Verificar que allLinks tiene datos antes de proceder
    if (!allLinks || !allLinks[1] || !allLinks[2] || allLinks[1].length === 0) {
        document.getElementById("status").textContent = "No hay PDFs para descargar";
        return;
    }

    // Hacemos una copia de allLinks
    // luego ejecutamos un intervalo cada 1000 milisegundos para extraer un elemento del array y descargarlo
    // cuando no haya elementos, cancelar el intervalo.
    //los pdf están en el array en posición 1
    var urls = allLinks[1];
    var nombres = allLinks[2];
    var interval = setInterval(function () {
        var url = urls.shift();
        var nombre = nombres.shift();
        if (url) {
            //Descargar el archivo
            chrome.downloads.download(
                {
                    url: url,
                    filename: nombre + ".pdf",
                },
                function (id) { },
            );
        } else {
            clearInterval(interval);
        }
    }, 1000);
}
//listener que recibe los elaces de send_links.js
chrome.runtime.onMessage.addListener(function (message) {
    console.log("Mensaje recibido en popup:", message);

    // Verificar si es un mensaje de error
    if (message && message.error) {
        document.getElementById("status").textContent = message.error;
        return true;
    }

    // Validar que links es un array con la estructura esperada
    var links = message;
    if (Array.isArray(links)) {
        // Asegurar que todos los elementos existen
        if (!links[0]) links[0] = [];
        if (!links[1]) links[1] = [];
        if (!links[2]) links[2] = [];

        allLinks = links;

        // Cambiamos los textos de los botones
        document.getElementById("cuenta-xml").innerText = allLinks[0].length || "0";
        document.getElementById("cuenta-pdf").innerText = allLinks[1].length || "0";

        // Habilitar/deshabilitar botones según si hay contenido para descargar
        document.getElementById("descargarxml").disabled = allLinks[0].length === 0;
        document.getElementById("descargarpdf").disabled = allLinks[1].length === 0;

        // Mostrar mensaje
        if (allLinks[0].length > 0 || allLinks[1].length > 0) {
            document.getElementById("status").textContent = "Listo para descargar " +
                allLinks[0].length + " XMLs y " + allLinks[1].length + " PDFs";
        } else {
            document.getElementById("status").textContent = "No se encontraron documentos para descargar";
        }
    } else {
        console.error("Formato de datos incorrecto recibido", links);
        document.getElementById("status").textContent = "Error: formato de datos incorrecto";
    }

    return true; // Mantiene el canal de mensaje abierto para respuestas asíncronas
});

window.onload = function () {
    //botones
    document.getElementById("descargarxml").onclick = descargarxml;
    document.getElementById("descargarpdf").onclick = descargarpdf;

    //enlaces
    document.getElementById("analizar").onclick = function () {
        chrome.tabs.create({
            url: "https://analizador-cfdi.netlify.app/",
        });
    };
    document.getElementById("iralsat").onclick = function () {
        chrome.tabs.create({
            url: "https://portalcfdi.facturaelectronica.sat.gob.mx",
        });
    };
    document.getElementById("manual").onclick = function () {
        chrome.tabs.create({
            url: "https://github.com/eduardoarandah/DescargaMasivaCFDIChrome",
        });
    };

    // Verificar estado inicial de los botones
    document.getElementById("descargarxml").disabled = true;
    document.getElementById("descargarpdf").disabled = true;
    document.getElementById("status").textContent = "Esperando a la página del SAT...";

    //esta función inyecta un JS a la tab activa para enviar los enlaces al listener
    chrome.windows.getCurrent(function (currentWindow) {
        chrome.tabs.query(
            {
                active: true,
                windowId: currentWindow.id,
            },
            function (activeTabs) {
                // Verificar si estamos en el SAT
                var url = activeTabs[0].url;
                var estamos_en_sat = url.includes("portalcfdi.facturaelectronica.sat.gob.mx");

                if (estamos_en_sat) {
                    document.getElementById("status").textContent = "Analizando la página del SAT...";

                    // Primero ejecutar un script para verificar que la página esté lista
                    chrome.scripting.executeScript({
                        target: { tabId: activeTabs[0].id },
                        func: function () {
                            // Devolver true si la página está completamente cargada
                            return document.readyState === 'complete' &&
                                document.querySelector('#ctl00_MainContent_tblResult') !== null;
                        }
                    }).then((results) => {
                        if (results[0].result) {
                            // La página está lista, inyectar el script principal
                            chrome.scripting.executeScript({
                                target: { tabId: activeTabs[0].id },
                                files: ["inject.js"]
                            });
                        } else {
                            // La página no está lista
                            document.getElementById("status").textContent =
                                "La página del SAT no está lista. Por favor, espere a que cargue completamente y vuelva a abrir esta extensión.";
                        }
                    }).catch(error => {
                        console.error("Error al ejecutar script:", error);
                        document.getElementById("status").textContent =
                            "Error al ejecutar la extensión. Intente recargar la página.";
                    });
                } else {
                    document.getElementById("status").textContent =
                        "No estás en el portal del SAT. Haz clic en 'Ir al SAT' primero.";
                }
            },
        );
    });
};
