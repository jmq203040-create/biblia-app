let biblia = null;
let libroActual = null;
let capituloActual = null;
let modoOscuro = false;
let marcadores = JSON.parse(localStorage.getItem('marcadores')) || [];
let notas = JSON.parse(localStorage.getItem('notas')) || [];

// Nombres de libros en español
const nombresLibros = [
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

async function cargarBiblia() {
    try {
        console.log("Intentando cargar biblia.json...");
        
        const respuesta = await fetch('biblia.json', { cache: 'no-cache' });
        
        if (!respuesta.ok) {
            throw new Error(`HTTP error! status: ${respuesta.status}`);
        }
        
        biblia = await respuesta.json();
        
        console.log("✅ Biblia cargada correctamente!");
        console.log("Total de libros:", biblia.length);
        
        llenarSelectLibros();
        
        const ultimo = localStorage.getItem('ultimoCapitulo');
        if (ultimo) {
            const datos = JSON.parse(ultimo);
            cargarCapitulo(datos.libroIndex, datos.capituloNum);
        } else {
            cargarCapitulo(0, 1);
        }
        
        actualizarBotonModoOscuro();
    } catch (error) {
        console.error("❌ Error detallado:", error);
        document.getElementById('textoBiblia').innerHTML = `
            <p style="color:red; text-align:center; padding:40px; font-size:1.2rem;">
                ❌ No se pudo cargar la Biblia<br><br>
                Error: ${error.message}
            </p>`;
    }
}
function llenarSelectLibros() {
    const selectLibro = document.getElementById('libroSelect');
    selectLibro.innerHTML = '<option value="">-- Selecciona un libro --</option>';
    
    if (!biblia || !Array.isArray(biblia) || biblia.length === 0) {
        console.error("La biblia no es un array válido");
        return;
    }
    
    console.log("Número de libros detectados:", biblia.length);
    console.log("Estructura del primer libro:", Object.keys(biblia[0]));
    
    biblia.forEach((libro, index) => {
        let nombreLibro = nombresLibros[index] || "Libro " + (index + 1);
        
        // Intentar diferentes posibles nombres del campo
        if (libro.name) nombreLibro = libro.name;
        else if (libro.book) nombreLibro = libro.book;
        else if (libro.title) nombreLibro = libro.title;
        else if (libro.nombre) nombreLibro = libro.nombre;
        
        const option = document.createElement('option');
        option.value = index;
        option.textContent = nombreLibro;
        selectLibro.appendChild(option);
    });
}


// Navegación de selectores
document.getElementById('libroSelect').addEventListener('change', function() {
    const libroIndex = parseInt(this.value);
    if (isNaN(libroIndex)) return;
    
    const libro = biblia[libroIndex];
    const selectCapitulo = document.getElementById('capituloSelect');
    selectCapitulo.innerHTML = '<option value="">-- Capítulo --</option>';
    
    const numCapitulos = libro.chapters ? libro.chapters.length : 150;
    for (let i = 1; i <= numCapitulos; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Capítulo ${i}`;
        selectCapitulo.appendChild(option);
    }
});

document.getElementById('capituloSelect').addEventListener('change', function() {
    const libroIndex = parseInt(document.getElementById('libroSelect').value);
    const capituloNum = parseInt(this.value);
    if (!isNaN(libroIndex) && !isNaN(capituloNum)) {
        cargarCapitulo(libroIndex, capituloNum);
    }
});

function cargarCapitulo(libroIndex, capituloNum) {
    if (!biblia) return;
    libroActual = libroIndex;
    capituloActual = capituloNum;
    
    const libro = biblia[libroIndex];
    const capitulo = libro.chapters[capituloNum - 1];
    
    if (!capitulo) return;
    
    localStorage.setItem('ultimoCapitulo', JSON.stringify({libroIndex, capituloNum}));
    mostrarCapitulo(libro, capituloNum, capitulo);
    
    document.getElementById('libroSelect').value = libroIndex;
    document.getElementById('capituloSelect').value = capituloNum;
}

function mostrarCapitulo(libro, capituloNum, capitulo) {
    const contenedor = document.getElementById('textoBiblia');
    let html = `<h2 style="text-align:center; margin-bottom:25px; color:#2e4a2b;">
        ${nombresLibros[libroActual]} ${capituloNum}
    </h2>`;
    
    capitulo.forEach((versiculo, index) => {
        const versKey = `${libroActual}-${capituloNum}-${index+1}`;
        const notaExistente = notas.find(n => n.key === versKey);
        
        html += `
            <div class="versiculo" data-libro="${libroActual}" data-cap="${capituloNum}" data-vers="${index+1}">
                <span class="numero-versiculo">${index + 1}</span>
                <span class="texto-versiculo">${versiculo}</span>
                <button class="btn-marcar" title="Añadir a marcadores">⭐</button>
                <button class="btn-nota" title="Añadir nota">📝</button>
            </div>
            ${notaExistente ? `<div class="nota-texto" style="margin-left:52px; margin-top:4px; font-size:0.95rem; color:#2e4a2b;">📌 ${notaExistente.texto}</div>` : ''}
        `;
    });
    
    contenedor.innerHTML = html;

    // Eventos para botones de marcar y nota
    document.querySelectorAll('.btn-marcar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const div = btn.parentElement;
            guardarMarcador(
                parseInt(div.dataset.libro),
                parseInt(div.dataset.cap),
                parseInt(div.dataset.vers)
            );
        });
    });

    document.querySelectorAll('.btn-nota').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const div = btn.parentElement;
            const libro = parseInt(div.dataset.libro);
            const cap = parseInt(div.dataset.cap);
            const vers = parseInt(div.dataset.vers);
            abrirEditorNota(libro, cap, vers);
        });
    });
}

// === MODO OSCURO ===
document.getElementById('btnModoOscuro').addEventListener('click', () => {
    modoOscuro = !modoOscuro;
    document.body.classList.toggle('dark', modoOscuro);
    localStorage.setItem('modoOscuro', modoOscuro);
    document.getElementById('btnModoOscuro').textContent = modoOscuro ? '☀️' : '🌙';
});

if (localStorage.getItem('modoOscuro') === 'true') {
    modoOscuro = true;
    document.body.classList.add('dark');
    document.getElementById('btnModoOscuro').textContent = '☀️';
}

// === MARCADORES ===
function guardarMarcador(libroIndex, capituloNum, versiculoNum) {
    const texto = biblia[libroIndex].chapters[capituloNum-1][versiculoNum-1];
    const marcador = {
        libroIndex,
        capituloNum,
        versiculoNum,
        texto: texto.substring(0, 120) + (texto.length > 120 ? '...' : ''),
        fecha: new Date().toISOString()
    };
    marcadores.unshift(marcador);
    localStorage.setItem('marcadores', JSON.stringify(marcadores));
    alert(`✅ Marcado: ${nombresLibros[libroIndex]} ${capituloNum}:${versiculoNum}`);
}

document.getElementById('btnMarcadores').addEventListener('click', mostrarMarcadores);

function mostrarMarcadores() {
    const modal = document.getElementById('modalMarcadores');
    const lista = document.getElementById('listaMarcadores');
    lista.innerHTML = '';
    
    if (marcadores.length === 0) {
        lista.innerHTML = '<p style="text-align:center; color:#888; padding:20px;">No tienes marcadores aún</p>';
    } else {
        marcadores.forEach(m => {
            const div = document.createElement('div');
            div.className = 'marcador-item';
            div.innerHTML = `
                <strong>${nombresLibros[m.libroIndex]} ${m.capituloNum}:${m.versiculoNum}</strong><br>
                ${m.texto}
            `;
            div.addEventListener('click', () => {
                cargarCapitulo(m.libroIndex, m.capituloNum);
                modal.style.display = 'none';
            });
            lista.appendChild(div);
        });
    }
    modal.style.display = 'block';
}

// === NOTAS PERSONALES ===
function abrirEditorNota(libroIndex, capituloNum, versiculoNum) {
    const key = `${libroIndex}-${capituloNum}-${versiculoNum}`;
    const notaExistente = notas.find(n => n.key === key);
    
    const textoNota = prompt(
        `Escribe tu nota para:\n\n${nombresLibros[libroIndex]} ${capituloNum}:${versiculoNum}\n\n`, 
        notaExistente ? notaExistente.texto : ""
    );
    
    if (textoNota === null) return; // usuario canceló
    
    if (textoNota.trim() === "") {
        notas = notas.filter(n => n.key !== key);
    } else {
        const nuevaNota = {
            key: key,
            libroIndex,
            capituloNum,
            versiculoNum,
            texto: textoNota.trim(),
            fecha: new Date().toISOString()
        };
        notas = notas.filter(n => n.key !== key);
        notas.unshift(nuevaNota);
    }
    
    localStorage.setItem('notas', JSON.stringify(notas));
    cargarCapitulo(libroActual, capituloActual); // recargar para mostrar la nota
}

document.getElementById('btnNotas').addEventListener('click', mostrarNotas);

function mostrarNotas() {
    const modal = document.getElementById('modalNotas');
    const lista = document.getElementById('listaNotas');
    lista.innerHTML = '';
    
    if (notas.length === 0) {
        lista.innerHTML = '<p style="text-align:center; color:#888; padding:20px;">Aún no tienes notas personales</p>';
    } else {
        notas.forEach(nota => {
            const div = document.createElement('div');
            div.className = 'nota-item';
            div.innerHTML = `
                <strong>${nombresLibros[nota.libroIndex]} ${nota.capituloNum}:${nota.versiculoNum}</strong>
                <div class="nota-texto">${nota.texto}</div>
            `;
            div.addEventListener('click', () => {
                cargarCapitulo(nota.libroIndex, nota.capituloNum);
                modal.style.display = 'none';
            });
            lista.appendChild(div);
        });
    }
    modal.style.display = 'block';
}

// Cerrar modales al tocar fuera
document.getElementById('modalMarcadores').addEventListener('click', function(e) {
    if (e.target === this) this.style.display = 'none';
});
document.getElementById('modalNotas').addEventListener('click', function(e) {
    if (e.target === this) this.style.display = 'none';
});

// Botones Anterior y Siguiente
document.getElementById('btnAnterior').addEventListener('click', () => {
    if (libroActual === null || capituloActual === null) return;
    if (capituloActual > 1) {
        cargarCapitulo(libroActual, capituloActual - 1);
    } else if (libroActual > 0) {
        const prevLibro = biblia[libroActual - 1];
        const ultimoCap = prevLibro.chapters ? prevLibro.chapters.length : 150;
        cargarCapitulo(libroActual - 1, ultimoCap);
    }
});

document.getElementById('btnSiguiente').addEventListener('click', () => {
    if (libroActual === null || capituloActual === null) return;
    const libro = biblia[libroActual];
    const totalCapitulos = libro.chapters ? libro.chapters.length : 150;
    
    if (capituloActual < totalCapitulos) {
        cargarCapitulo(libroActual, capituloActual + 1);
    } else if (libroActual < biblia.length - 1) {
        cargarCapitulo(libroActual + 1, 1);
    }
});

// Búsqueda
document.getElementById('btnBuscar').addEventListener('click', realizarBusqueda);
document.getElementById('busquedaInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') realizarBusqueda();
});

function realizarBusqueda() {
    const termino = document.getElementById('busquedaInput').value.trim().toLowerCase();
    if (!termino || !biblia) {
        alert("Escribe una palabra para buscar");
        return;
    }
    
    let resultados = [];
    biblia.forEach((libro, libroIndex) => {
        if (!libro.chapters) return;
        libro.chapters.forEach((capitulo, capIndex) => {
            capitulo.forEach((versiculo, versIndex) => {
                if (versiculo.toLowerCase().includes(termino)) {
                    resultados.push({
                        libroIndex,
                        capituloNum: capIndex + 1,
                        versiculoNum: versIndex + 1,
                        texto: versiculo,
                        libroNombre: nombresLibros[libroIndex]
                    });
                }
            });
        });
    });
    
    if (resultados.length === 0) {
        alert(`No se encontraron resultados para "${termino}"`);
        return;
    }
    
    const contenedor = document.getElementById('textoBiblia');
    let html = `<h2 style="text-align:center; margin-bottom:20px; color:#2e4a2b;">
        Resultados para: "${termino}" (${resultados.length} versículos)
    </h2>`;
    
    resultados.forEach(res => {
        html += `
            <div class="versiculo" style="cursor:pointer; padding:15px; border-left:5px solid #4a7043;" 
                 onclick="cargarCapitulo(${res.libroIndex}, ${res.capituloNum})">
                <strong>${res.libroNombre} ${res.capituloNum}:${res.versiculoNum}</strong><br>
                ${res.texto}
            </div>
        `;
    });
    
    contenedor.innerHTML = html;
}

// Iniciar la aplicación
cargarBiblia();