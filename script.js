
const SUPABASE_URL = "https://vhczwcsglfgioiurcths.supabase.co";
const SUPABASE_KEY = "ssb_publishable_ElVFpBMp8VFIvm3BUA-V0w_JY7xbGSm";

let supabase = null;

if (window.supabase) {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
  console.error("Supabase no cargó ❌");
}

let esAdmin = false;

// LOGIN
function mostrarLogin() {
  document.getElementById("login").style.display = "flex";
}

function cerrarLogin() {
  document.getElementById("login").style.display = "none";
}

function login() {
  const user = document.getElementById("user").value;
  const pass = document.getElementById("pass").value;

  if (user === "admin" && pass === "1234") {
    esAdmin = true;
    cerrarLogin();

    document.getElementById("btnAgregar").style.display = "inline-block";
    mostrarBotonSalir();

    cargarSemanas();

    alert("Modo desarrollador activado 😎");
  } else {
    alert("Datos incorrectos");
  }
}

// SALIR
function mostrarBotonSalir() {
  let btn = document.getElementById("btnSalir");

  if (!btn) {
    btn = document.createElement("button");
    btn.id = "btnSalir";
    btn.textContent = "🚪 Salir";
    btn.onclick = cerrarSesion;

    document.querySelector(".usuario").appendChild(btn);
  }
}

function cerrarSesion() {
  esAdmin = false;
  document.getElementById("btnAgregar").style.display = "none";
  document.getElementById("btnSalir")?.remove();
  cargarSemanas();
}

// CARGAR
async function cargarSemanas() {
  const { data } = await supabase.from("semanas").select("*");

  const contenedor = document.getElementById("contenedor-semanas");
  contenedor.innerHTML = "";

  data.forEach(s => crearSemana(s));
}

// CREAR UI
function crearSemana(s) {
  const contenedor = document.getElementById("contenedor-semanas");

  const div = document.createElement("div");
  div.classList.add("semana");

  div.innerHTML = `
    <h3>${s.titulo}</h3>
    <iframe src="${s.pdf_url}"></iframe>
    <br>
    <a href="${s.pdf_url}" class="descargar" download>⬇️ Descargar</a>
    ${esAdmin ? '<br><button class="eliminar">🗑️</button>' : ''}
  `;

  if (esAdmin) {
    div.querySelector(".eliminar").onclick = async () => {
      await supabase.from("semanas").delete().eq("id", s.id);
      cargarSemanas();
    };
  }

  contenedor.appendChild(div);
}

// AGREGAR
async function agregarSemana() {
  const titulo = prompt("Nombre de la semana:");

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/pdf";
  input.click();

  input.onchange = async () => {
    const file = input.files[0];
    const nombre = Date.now() + "_" + file.name;

    const { data, error } = await supabase
    .storage
    .from("pdfs")
    .upload(nombre, file);

   console.log("UPLOAD:", data);
   console.log("ERROR:", error);

   if (error) {
      alert("Error al subir PDF ❌");
      return;
   }

    const { data } = supabase.storage.from("pdfs").getPublicUrl(nombre);

    await supabase.from("semanas").insert([
      { titulo: titulo, pdf_url: data.publicUrl }
    ]);

    cargarSemanas();
  };
}

// INICIAR
cargarSemanas();
