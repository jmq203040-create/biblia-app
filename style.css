let biblia = null;
let libroActual = null;
let capituloActual = null;
let modoOscuro = false;
let tamanoFuente = 18;

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

// ==================== LLENAR LIBROS ====================
function llenarLibros() {
    const select = document.getElementById('libroSelect');
    select.innerHTML = '<option value="">-- Libro --</option>';
    
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
                <div class="versiculo">
                    <span class="numero-versiculo">${numVers}</span>
                    <span class="texto-versiculo">${capituloData[numVers]}</span>
                </div>`;
        }
    });
    
    document.getElementById('textoBiblia').innerHTML = html;
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

// Iniciar
iniciarApp();
