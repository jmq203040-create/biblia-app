let biblia = null;
let libroActual = null;
let capituloActual = null;
let modoOscuro = false;
let tamanoFuente = 18;
let ordenActual = "biblico"; // "biblico" o "alfabetico"

// ==================== INICIAR APP ====================
async function iniciarApp() {
    try {
        const resp = await fetch('biblia.json?' + Date.now());
        biblia = await resp.json();
        llenarLibros();
    } catch (e) {
        console.error("Error cargando biblia:", e);
        document.getElementById('textoBiblia').innerHTML = "<p style='color:red; text-align:center; padding:50px;'>Error al cargar la Biblia</p>";
    }
}


// ==================== LLENAR LIBROS CON ORDEN (Bíblico / Alfabético) ====================
function llenarLibros() {
    const select = document.getElementById('libroSelect');
    select.innerHTML = '<option value="">-- Selecciona un libro --</option>';
    
    const ordenBiblico = [
        "Génesis", "Éxodo", "Levítico", "Números", "Deuteronomio",
        "Josué", "Jueces", "Rut", "1 Samuel", "2 Samuel",
        "1 Reyes", "2 Reyes", "1 Crónicas", "2 Crónicas", "Esdras",
        "Nehemías", "Ester", "Job", "Salmos", "Proverbios",
        "Eclesiastés", "Cantares", "Isaías", "Jeremías", "Lamentaciones",
        "Ezequiel", "Daniel", "Oseas", "Joel", "Amós",
        "Abdías", "Jonás", "Miqueas", "Nahúm", "Habacuc",
        "Sofonías", "Hageo", "Zacarías", "Malaquías",
        "Mateo", "Marcos", "Lucas", "Juan", "Hechos",
        "Romanos", "1 Corintios", "2 Corintios", "Gálatas", "Efesios",
        "Filipenses", "Colosenses", "1 Tesalonicenses", "2 Tesalonicenses",
        "1 Timoteo", "2 Timoteo", "Tito", "Filemón", "Hebreos",
        "Santiago", "1 Pedro", "2 Pedro", "1 Juan", "2 Juan",
        "3 Juan", "Judas", "Apocalipsis"
    ];

    if (window.ordenActual === "alfabetico") {
        // Orden alfabético
        Object.keys(biblia).sort().forEach((nombreLibro) => {
            const index = Object.keys(biblia).indexOf(nombreLibro);
            const opt = document.createElement('option');
            opt.value = index;
            opt.textContent = nombreLibro;
            select.appendChild(opt);
        });
    } else {
        // Orden bíblico (por defecto)
        ordenBiblico.forEach((nombreLibro) => {
            if (biblia[nombreLibro]) {
                const index = Object.keys(biblia).indexOf(nombreLibro);
                const opt = document.createElement('option');
                opt.value = index;
                opt.textContent = nombreLibro;
                select.appendChild(opt);
            }
        });
    }
}

// ==================== CAMBIO DE LIBRO ====================
document.getElementById('libroSelect').addEventListener('change', function() {
    const index = parseInt(this.value);
    if (isNaN(index)) return;
    libroActual = index;
    
    const nombreLibro = Object.keys(biblia)[index];
    const libro = biblia[nombreLibro];
    
    const selectCap = document.getElementById('capituloSelect');
    selectCap.innerHTML = '<option value="">-- Cap --</option>';
    
    Object.keys(libro).forEach(cap => {
        if (!isNaN(parseInt(cap))) {
            const opt = document.createElement('option');
            opt.value = cap;
            opt.textContent = cap;
            selectCap.appendChild(opt);
        }
    });
    
    cargarCapitulo(index, 1);
});

// ==================== CAMBIO DE CAPÍTULO ====================
document.getElementById('capituloSelect').addEventListener('change', function() {
    const capituloNum = parseInt(this.value);
    if (isNaN(capituloNum) || libroActual === null) return;
    cargarCapitulo(libroActual, capituloNum);
});

// ==================== CARGAR CAPÍTULO ====================
function cargarCapitulo(libroIndex, capituloNum) {
    libroActual = libroIndex;
    capituloActual = capituloNum;
    
    const nombreLibro = Object.keys(biblia)[libroIndex];
    const libro = biblia[nombreLibro];
    const capituloData = libro[capituloNum.toString()];
    
    let html = `<h2 style="text-align:center; margin:20px 0; color:#2e4a2b;">${nombreLibro} ${capituloNum}</h2>`;
    
    Object.keys(capituloData).forEach(numVers => {
        if (!isNaN(parseInt(numVers))) {
            html += `
    <div class="versiculo" data-libro="${libroIndex}" data-cap="${capituloNum}" data-vers="${numVers}">
        <span class="numero-versiculo">${numVers}</span>
        <span class="texto-versiculo">${capituloData[numVers]}</span>
        <button class="btn-marcar" style="font-size:1.35rem;">⭐</button>
        <button class="btn-resaltar" style="font-size:1.25rem;">🎨</button>
    </div>`;
        }
    });
    
    document.getElementById('textoBiblia').innerHTML = html;
        // Eventos para marcadores y resaltadores
    document.querySelectorAll('.btn-marcar').forEach(btn => {
        btn.addEventListener('click', guardarMarcador);
    });
    
    document.querySelectorAll('.btn-resaltar').forEach(btn => {
        btn.addEventListener('click', resaltarVersiculo);
    });
    actualizarTamanoFuente();
}

// ==================== ANTERIOR Y SIGUIENTE ====================
document.getElementById('btnAnterior').addEventListener('click', () => {
    if (capituloActual > 1) cargarCapitulo(libroActual, capituloActual - 1);
});

document.getElementById('btnSiguiente').addEventListener('click', () => {
    const nombreLibro = Object.keys(biblia)[libroActual];
    const libro = biblia[nombreLibro];
    const totalCaps = Object.keys(libro).filter(k => !isNaN(parseInt(k))).length;
    
    if (capituloActual < totalCaps) {
        cargarCapitulo(libroActual, capituloActual + 1);
    }
});

// ==================== TAMAÑO DE FUENTE ====================
function actualizarTamanoFuente() {
    const contenedor = document.getElementById('textoBiblia');
    if (contenedor) contenedor.style.fontSize = tamanoFuente + 'px';
}

document.getElementById('btnFuenteMas').addEventListener('click', () => {
    tamanoFuente = Math.min(tamanoFuente + 3, 32);
    actualizarTamanoFuente();
});

document.getElementById('btnFuenteMenos').addEventListener('click', () => {
    tamanoFuente = Math.max(tamanoFuente - 3, 13);
    actualizarTamanoFuente();
});

// ==================== MODO OSCURO ====================
document.getElementById('btnModoOscuro').addEventListener('click', () => {
    modoOscuro = !modoOscuro;
    document.body.classList.toggle('dark', modoOscuro);
    document.getElementById('btnModoOscuro').textContent = modoOscuro ? '☀️' : '🌙';
});

// ==================== MENÚ ====================
const btnMenu = document.getElementById('btnMenu');
const menuAcciones = document.getElementById('menuAcciones');

btnMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    menuAcciones.style.display = menuAcciones.style.display === 'block' ? 'none' : 'block';
});

document.addEventListener('click', () => {
    menuAcciones.style.display = 'none';
});
// ==================== MARCADORES ====================
function guardarMarcador(e) {
    const div = e.target.parentElement;
    const libroIndex = parseInt(div.dataset.libro);
    const cap = parseInt(div.dataset.cap);
    const vers = parseInt(div.dataset.vers);
    
    const nombreLibro = Object.keys(biblia)[libroIndex];
    const texto = biblia[nombreLibro][cap.toString()][vers.toString()];
    
    alert(`✅ Marcado: ${nombreLibro} ${cap}:${vers}`);
}

// ==================== RESALTADO DE COLORES ====================
function resaltarVersiculo(e) {
    const versiculoDiv = e.target.parentElement;
    const colorClass = "resaltado-amarillo";   // amarillo por ahora
    
    if (versiculoDiv.classList.contains(colorClass)) {
        versiculoDiv.classList.remove(colorClass);
    } else {
        versiculoDiv.classList.add(colorClass);
    }
}
// Iniciar
// ==================== BÚSQUEDA EXACTA: BLINDAJE MÁXIMO ====================
// Firmware refactorizado por Master King electroniK - V2.0 (Estabilidad Total)

document.getElementById('btnBuscarFull').addEventListener('click', realizarBusqueda);

function realizarBusqueda() {
    let termino = prompt("🔍 Búsqueda EXACTA en la Biblia:\n\nEscribe la palabra completa (ej: sal):");
    if (!termino || termino.trim() === "") return;

    termino = termino.trim(); 

    // Escapamos la entrada para evitar inyecciones de código
    const termEscapado = termino.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // 🧠 NUEVO MOTOR NEURONAL: Sin Lookbehinds para evitar cuelgues (crashes).
    // Grupo 1 ($1): Inicio de línea (^) o cualquier cosa que NO sea letra/número.
    // Grupo 2 ($2): Tu palabra exacta.
    // Lookahead (?=): Fin de línea o cualquier cosa que NO sea letra/número.
    const regexExacta = new RegExp(`(^|[^\\p{L}\\p{N}])(${termEscapado})(?=[^\\p{L}\\p{N}]|$)`, 'giu');

    let htmlSalida = []; 
    let contadorResultados = 0;
    let libroIndex = 0; 

    for (const nombreLibro in biblia) {
        const libro = biblia[nombreLibro];
        
        for (const capNum in libro) {
            if (isNaN(capNum)) continue; 
            
            const capitulo = libro[capNum];
            
            for (const versNum in capitulo) {
                const textoVersiculo = capitulo[versNum];
                
                regexExacta.lastIndex = 0; 
                
                if (regexExacta.test(textoVersiculo)) {
                    contadorResultados++;
                    
                    // Reseteamos el index antes del replace
                    regexExacta.lastIndex = 0;
                    
                    // Inyectamos el <mark> EXACTAMENTE en el Grupo 2, respetando lo que haya antes ($1)
                    const textoResaltado = textoVersiculo.replace(
                        regexExacta, 
                        `$1<mark style="background-color: #ffd700; color: #000; font-weight: bold; padding: 0 2px;">$2</mark>`
                    );

                    htmlSalida.push(`
                        <div class="versiculo" style="cursor:pointer; padding:12px; border-left:5px solid #4a7043; margin-bottom: 8px;" 
                             onclick="cargarCapitulo(${libroIndex}, ${capNum}); document.getElementById('menuAcciones').style.display='none';">
                            <strong>${nombreLibro} ${capNum}:${versNum}</strong><br>
                            ${textoResaltado}
                        </div>
                    `);
                }
            }
        }
        libroIndex++;
    }

    if (contadorResultados === 0) {
        alert(`Búsqueda estricta: No se encontraron coincidencias exactas para "${termino}".`);
        return;
    }

    document.getElementById('textoBiblia').innerHTML = `
        <h2 style="text-align:center;">Resultados exactos para: "${termino}" (${contadorResultados})</h2>
        ${htmlSalida.join('')} 
    `;
    // ==================== CAMBIAR ORDEN DE LIBROS ====================
document.getElementById('btnOrdenLibros').addEventListener('click', function() {
    ordenActual = ordenActual === "biblico" ? "alfabetico" : "biblico";
    
    const btn = document.getElementById('btnOrdenLibros');
    btn.textContent = ordenActual === "biblico" ? "Orden: Bíblico" : "Orden: Alfabético";
    
    llenarLibros(); // Recargar los libros con el nuevo orden
});
}
iniciarApp();
