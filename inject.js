//este script busca los arrays y los manda a la ventanita popup
var links = new Array();
console.log("Inject.js script ejecutándose en la página del SAT");

// Verificamos que estamos en la página correcta
if (document.location.href.includes("portalcfdi.facturaelectronica.sat.gob.mx")) {
  // Continuamos con el script solo si estamos en la página del SAT

  //array para los XML
  links[0] = new Array();
  console.log("Buscando elementos XML con name='BtnDescarga'");
  var elementos = document.getElementsByName("BtnDescarga");
  console.log("Elementos XML encontrados:", elementos.length);

  //por cada elemento buscamos el texto adentro:
  for (var i = 0; i < elementos.length; i++) {
    try {
      //buscamos en el HTML
      var textoOnclick = elementos[i].getAttribute("onclick") || elementos[i].outerHTML;
      console.log("XML onclick text:", textoOnclick);

      //buscamos la URL relativa con regex
      var urlRelativa = textoOnclick.match(/RecuperaCfdi\.aspx\?Datos=[^']+/);
      //si la encontramos:
      if (urlRelativa && urlRelativa.length > 0) {
        var urlAbsoluta =
          "https://portalcfdi.facturaelectronica.sat.gob.mx/" + urlRelativa[0];
        links[0].push(urlAbsoluta);
        console.log("URL XML encontrada:", urlAbsoluta);
      }
    } catch (error) {
      console.error("Error al procesar elemento XML:", error);
    }
  }
  console.log("URLs XML encontradas:", links[0].length);

  //array para los PDF
  links[1] = new Array();
  console.log("Buscando elementos PDF con name='BtnRI'");
  var elementos = document.getElementsByName("BtnRI");
  console.log("Elementos PDF encontrados:", elementos.length);

  //por cada elemento buscamos el texto adentro:
  for (var i = 0; i < elementos.length; i++) {
    try {
      //buscamos en el HTML
      var textoOnclick = elementos[i].getAttribute("onclick") || elementos[i].outerHTML;
      console.log("PDF onclick text:", textoOnclick);

      //buscamos el parámetro para la representación impresa
      var parametro = textoOnclick.match(/recuperaRepresentacionImpresa\('([^']+)/);
      //si la encontramos:
      if (parametro && parametro.length > 1) {
        var datos = parametro[1]; // Obtener el grupo capturado
        var urlAbsoluta =
          "https://portalcfdi.facturaelectronica.sat.gob.mx/RepresentacionImpresa.aspx?Datos=" +
          datos;
        links[1].push(urlAbsoluta);
        console.log("URL PDF encontrada:", urlAbsoluta);
      }
    } catch (error) {
      console.error("Error al procesar elemento PDF:", error);
    }
  }
  console.log("URLs PDF encontradas:", links[1].length);

  //array con los folios
  links[2] = new Array();
  console.log("Buscando elementos de folios con name='ListaFolios'");
  var folios = document.getElementsByName("ListaFolios");
  console.log("Elementos de folios encontrados:", folios.length);

  //por cada elemento buscamos la etiqueta "value"
  for (var i = 0; i < folios.length; i++) {
    try {
      if (folios[i].getAttribute("value")) {
        var folio = folios[i].getAttribute("value");
        links[2].push(folio);
        console.log("Folio encontrado:", folio);
      }
    } catch (error) {
      console.error("Error al procesar folio:", error);
    }
  }
  console.log("Folios encontrados:", links[2].length);

  // Si no encontramos elementos con los métodos tradicionales, intentamos con selectors más específicos
  if (links[0].length === 0 || links[1].length === 0 || links[2].length === 0) {
    console.log("Usando métodos alternativos basados en el DOM exacto");

    // Para XMLs - Busca específicamente los elementos span con la clase 'glyphicon-cloud-download'
    if (links[0].length === 0) {
      var botonesXML = document.querySelectorAll('span.glyphicon-cloud-download.Interactivo');
      console.log("Botones XML alternativos encontrados:", botonesXML.length);
      for (var i = 0; i < botonesXML.length; i++) {
        try {
          var onClick = botonesXML[i].getAttribute("onclick");
          if (onClick) {
            var match = onClick.match(/RecuperaCfdi\.aspx\?Datos=([^']+)/);
            if (match && match.length > 1) {
              var urlAbsoluta = "https://portalcfdi.facturaelectronica.sat.gob.mx/RecuperaCfdi.aspx?Datos=" + match[1];
              links[0].push(urlAbsoluta);
              console.log("URL XML alternativa encontrada:", urlAbsoluta);
            }
          }
        } catch (error) {
          console.error("Error al procesar XML alternativo:", error);
        }
      }
    }

    // Para PDFs - Busca específicamente los elementos span con la clase 'glyphicon-file'
    if (links[1].length === 0) {
      var botonesPDF = document.querySelectorAll('span.glyphicon-file.Interactivo');
      console.log("Botones PDF alternativos encontrados:", botonesPDF.length);
      for (var i = 0; i < botonesPDF.length; i++) {
        try {
          var onClick = botonesPDF[i].getAttribute("onclick");
          if (onClick) {
            var match = onClick.match(/recuperaRepresentacionImpresa\('([^']+)/);
            if (match && match.length > 1) {
              var urlAbsoluta = "https://portalcfdi.facturaelectronica.sat.gob.mx/RepresentacionImpresa.aspx?Datos=" + match[1];
              links[1].push(urlAbsoluta);
              console.log("URL PDF alternativa encontrada:", urlAbsoluta);
            }
          }
        } catch (error) {
          console.error("Error al procesar PDF alternativo:", error);
        }
      }
    }

    // Para folios
    if (links[2].length === 0) {
      var folioCheckboxes = document.querySelectorAll('input.ListaFolios[type="checkbox"]');
      console.log("Checkboxes de folios alternativos encontrados:", folioCheckboxes.length);
      for (var i = 0; i < folioCheckboxes.length; i++) {
        try {
          var valor = folioCheckboxes[i].getAttribute("value");
          if (valor) {
            links[2].push(valor);
            console.log("Folio alternativo encontrado:", valor);
          }
        } catch (error) {
          console.error("Error al procesar folio alternativo:", error);
        }
      }
    }
  }

  // Aseguramos que todos los arrays tienen la misma longitud
  console.log("Verificando longitudes finales:", links[0].length, links[1].length, links[2].length);
  var length = Math.max(links[0].length, links[1].length);
  if (links[2].length < length) {
    console.log("Ajustando longitud de folios");
    // Completamos folios faltantes
    while (links[2].length < length) {
      links[2].push("CFDI_" + links[2].length);
    }
  }

  // Enviamos el array de arrays a la ventanita, al listener
  if (links[0].length > 0 || links[1].length > 0) {
    console.log("Enviando datos a la extensión:", links);
    chrome.runtime.sendMessage(links);
  } else {
    console.error("No se encontraron elementos necesarios");
    chrome.runtime.sendMessage({ error: "No se pudieron encontrar documentos en esta página. Intenta recargar la página." });
  }
} else {
  console.error("No estamos en la página del SAT");
  chrome.runtime.sendMessage({ error: "No estamos en la página del SAT. Navega a https://portalcfdi.facturaelectronica.sat.gob.mx primero." });
}
