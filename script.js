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
    
    // Cargar capítulo 1 por defecto
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
    
    if (!capituloData) {
        document.getElementById('textoBiblia').innerHTML = "<p>Capítulo no encontrado</p>";
        return;
    }
    
    let html = `<h2 style="text-align:center; margin:25px 0; color:#2e4a2b;">${nombreLibro} ${capituloNum}</h2>`;
    
    Object.keys(capituloData).forEach(numVers => {
        if (!isNaN(parseInt(numVers))) {
            const texto = capituloData[numVers];
            const versKey = `${libroIndex}-${capituloNum}-${numVers}`;
            const tieneNota = notas.find(n => n.key === versKey);
            
            html += `
                <div class="versiculo" data-libro="${libroIndex}" data-cap="${capituloNum}" data-vers="${numVers}">
                    <span class="numero-versiculo">${numVers}</span>
                    <span class="texto-versiculo">${texto}</span>
                    <button class="btn-marcar" style="margin-left:auto; font-size:1.5rem;">⭐</button>
                    <button class="btn-nota" style="font-size:1.4rem;">📝</button>
                </div>
                ${tieneNota ? `<div style="margin-left:50px; color:#2e4a2b; font-size:0.95rem;">📌 ${tieneNota.texto}</div>` : ''}
            `;
        }
    });
    
    document.getElementById('textoBiblia').innerHTML = html;
    actualizarTamanoFuente();
    
    // Eventos de botones
    document.querySelectorAll('.btn-marcar').forEach(btn => btn.addEventListener('click', guardarMarcador));
    document.querySelectorAll('.btn-nota').forEach(btn => btn.addEventListener('click', abrirNota));
}

// ==================== ANTERIOR / SIGUIENTE ====================
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
    document.getElementById('textoBiblia').style.fontSize = tamanoFuente + 'px';
}

document.getElementById('btnFuenteMas').addEventListener('click', () => {
    tamanoFuente = Math.min(tamanoFuente + 2, 28);
    actualizarTamanoFuente();
    localStorage.setItem('tamanoFuente', tamanoFuente);
});

document.getElementById('btnFuenteMenos').addEventListener('click', () => {
    tamanoFuente = Math.max(tamanoFuente - 2, 14);
    actualizarTamanoFuente();
    localStorage.setItem('tamanoFuente', tamanoFuente);
});

// ==================== MARCADORES, NOTAS, MODO OSCURO Y BÚSQUEDA (mantengo lo anterior) ====================
function guardarMarcador(e) {
    const div = e.target.parentElement;
    const libroIndex = parseInt(div.dataset.libro);
    const cap = parseInt(div.dataset.cap);
    const vers = parseInt(div.dataset.vers);
    
    const nombreLibro = Object.keys(biblia)[libroIndex];
    const texto = biblia[nombreLibro][cap.toString()][vers.toString()];
    
    marcadores.unshift({ libroIndex, cap, vers, texto: texto.substring(0,100)+'...', fecha: new Date().toISOString() });
    localStorage.setItem('marcadores', JSON.stringify(marcadores));
    alert(`✅ Marcado: ${nombreLibro} ${cap}:${vers}`);
}

function abrirNota(e) {
    const div = e.target.parentElement;
    const libroIndex = parseInt(div.dataset.libro);
    const cap = parseInt(div.dataset.cap);
    const vers = parseInt(div.dataset.vers);
    const key = `${libroIndex}-${cap}-${vers}`;
    
    const textoNota = prompt("Escribe tu nota para este versículo:", "");
    if (textoNota === null || textoNota.trim() === "") return;
    
    notas.unshift({ key, libroIndex, cap, vers, texto: textoNota.trim() });
    localStorage.setItem('notas', JSON.stringify(notas));
    cargarCapitulo(libroActual, capituloActual);
}

document.getElementById('btnModoOscuro').addEventListener('click', () => {
    modoOscuro = !modoOscuro;
    document.body.classList.toggle('dark', modoOscuro);
    document.getElementById('btnModoOscuro').textContent = modoOscuro ? '☀️' : '🌙';
});

document.getElementById('btnMarcadores').addEventListener('click', () => alert("Marcadores: " + marcadores.length));
document.getElementById('btnNotas').addEventListener('click', () => alert("Notas: " + notas.length));

// Búsqueda (básica)
document.getElementById('btnBuscar').addEventListener('click', realizarBusqueda);
document.getElementById('busquedaInput').addEventListener('keypress', e => { if(e.key === 'Enter') realizarBusqueda(); });

function realizarBusqueda() {
    const termino = document.getElementById('busquedaInput').value.trim().toLowerCase();
    if (!termino) return alert("Escribe una palabra");
    alert("Búsqueda en desarrollo...\n\nSe implementará completamente en el siguiente nivel.");
}

// Iniciar
iniciarApp();
