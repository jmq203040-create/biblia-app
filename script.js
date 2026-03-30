let biblia = null;
let libroActual = null;
let capituloActual = null;
let modoOscuro = false;
let marcadores = JSON.parse(localStorage.getItem('marcadores')) || [];
let notas = JSON.parse(localStorage.getItem('notas')) || [];
let tamanoFuente = 18;

// ==================== INICIAR APP ====================
async function iniciarApp() {
    try {
        const resp = await fetch('biblia.json?' + Date.now());
        biblia = await resp.json();
        llenarLibros();
    } catch (e) {
        console.error(e);
    }
}

// ==================== LIBROS ====================
function llenarLibros() {
    const select = document.getElementById('libroSelect');
    select.innerHTML = '<option value="">-- Selecciona un libro --</option>';
    
    Object.keys(biblia).forEach((nombre, index) => {
        const opt = document.createElement('option');
        opt.value = index;
        opt.textContent = nombre;
        select.appendChild(opt);
    });
}

// ==================== CAMBIO DE LIBRO ====================
document.getElementById('libroSelect').addEventListener('change', function() {
    const index = parseInt(this.value);
    if (isNaN(index)) return;
    libroActual = index;
    const nombreLibro = Object.keys(biblia)[index];
    const libro = biblia[nombreLibro];
    
    const selectCap = document.getElementById('capituloSelect');
    selectCap.innerHTML = '<option value="">-- Capítulo --</option>';
    
    Object.keys(libro).forEach(cap => {
        if (!isNaN(parseInt(cap))) {
            const opt = document.createElement('option');
            opt.value = cap;
            opt.textContent = `Capítulo ${cap}`;
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
    
    let html = `<h2 style="text-align:center; margin:25px 0; color:#2e4a2b;">${nombreLibro} ${capituloNum}</h2>`;
    
    Object.keys(capituloData).forEach(numVers => {
        if (!isNaN(parseInt(numVers))) {
            const texto = capituloData[numVers];
            html += `
                <div class="versiculo" data-libro="${libroIndex}" data-cap="${capituloNum}" data-vers="${numVers}">
                    <span class="numero-versiculo">${numVers}</span>
                    <span class="texto-versiculo">${texto}</span>
                    <button class="btn-marcar" style="margin-left:auto; font-size:1.5rem;">⭐</button>
                    <button class="btn-nota" style="font-size:1.4rem;">📝</button>
                </div>`;
        }
    });
    
    document.getElementById('textoBiblia').innerHTML = html;
    actualizarTamanoFuente();
    
    document.querySelectorAll('.btn-marcar').forEach(btn => btn.addEventListener('click', guardarMarcador));
    document.querySelectorAll('.btn-nota').forEach(btn => btn.addEventListener('click', abrirNota));
}

// ==================== BÚSQUEDA MEJORADA ====================
document.getElementById('btnBuscar').addEventListener('click', realizarBusqueda);
document.getElementById('busquedaInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') realizarBusqueda();
});

function realizarBusqueda() {
    const termino = document.getElementById('busquedaInput').value.trim().toLowerCase();
    if (!termino) {
        alert("Por favor escribe una palabra o frase");
        return;
    }
    
    let resultados = [];
    
    Object.keys(biblia).forEach((nombreLibro, libroIndex) => {
        const libro = biblia[nombreLibro];
        Object.keys(libro).forEach(capNum => {
            if (isNaN(parseInt(capNum))) return;
            const capitulo = libro[capNum];
            Object.keys(capitulo).forEach(versNum => {
                const texto = capitulo[versNum].toLowerCase();
                if (texto.includes(termino)) {
                    resultados.push({
                        libroIndex: libroIndex,
                        libroNombre: nombreLibro,
                        capitulo: capNum,
                        versiculo: versNum,
                        texto: capitulo[versNum]
                    });
                }
            });
        });
    });
    
    if (resultados.length === 0) {
        alert(`No se encontraron resultados para "${termino}"`);
        return;
    }
    
    let html = `<h2 style="text-align:center; margin:20px 0;">Resultados para: "${termino}" (${resultados.length})</h2>`;
    
    resultados.forEach(res => {
        html += `
            <div class="versiculo" style="cursor:pointer; padding:12px; border-left:5px solid #4a7043;" 
                 onclick="cargarCapitulo(${res.libroIndex}, ${res.capitulo})">
                <strong>${res.libroNombre} ${res.capitulo}:${res.versiculo}</strong><br>
                ${res.texto}
            </div>`;
    });
    
    document.getElementById('textoBiblia').innerHTML = html;
}

// ==================== OTRAS FUNCIONES (Marcadores, Notas, Fuente, etc.) ====================
function guardarMarcador(e) { /* ... */ }
function abrirNota(e) { /* ... */ }
function actualizarTamanoFuente() { /* ... */ }

// Botones Anterior / Siguiente
document.getElementById('btnAnterior').addEventListener('click', () => {
    if (capituloActual > 1) cargarCapitulo(libroActual, capituloActual - 1);
});

document.getElementById('btnSiguiente').addEventListener('click', () => {
    const nombreLibro = Object.keys(biblia)[libroActual];
    const totalCaps = Object.keys(biblia[nombreLibro]).filter(k => !isNaN(parseInt(k))).length;
    if (capituloActual < totalCaps) cargarCapitulo(libroActual, capituloActual + 1);
});

// Modo Oscuro
document.getElementById('btnModoOscuro').addEventListener('click', () => {
    modoOscuro = !modoOscuro;
    document.body.classList.toggle('dark', modoOscuro);
    document.getElementById('btnModoOscuro').textContent = modoOscuro ? '☀️' : '🌙';
});

// Iniciar
iniciarApp();
