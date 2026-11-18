feather.replace();

const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector("#search-input");
const searchBtn = document.querySelector("#search");
const themeBtn = document.querySelector("#sun");

function setTema(gelap) {
  document.body.classList.toggle("dark-mode", gelap);

  if (themeBtn) {
    themeBtn.innerHTML = `<i data-feather="${gelap ? "sun" : "moon"}"></i>`;
    themeBtn.title = gelap ? "Ganti ke mode terang" : "Ganti ke mode gelap";
    feather.replace();
  }

  try {
    localStorage.setItem("tema", gelap ? "gelap" : "terang");
  } catch (e) {}
}

let temaTersimpan = null;
try {
  temaTersimpan = localStorage.getItem("tema");
} catch (e) {}

const awalGelap =
  temaTersimpan !== null
    ? temaTersimpan === "gelap"
    : window.matchMedia("(prefers-color-scheme: dark)").matches;

setTema(awalGelap);

if (themeBtn) {
  themeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    setTema(!document.body.classList.contains("dark-mode"));
  });
}

const KARTU = ".kisahfavorit-card, .daftarkisah-item";

function saring(kata) {
  const value = kata.toLowerCase().trim();
  const cards = document.querySelectorAll(KARTU);
  let ada = 0;

  cards.forEach((card) => {
    const title = card.querySelector("h3").innerText.toLowerCase();
    const desc = card.querySelector("p").innerText.toLowerCase();
    const cocok = title.includes(value) || desc.includes(value);
    card.style.display = cocok ? "" : "none";
    if (cocok) ada++;
  });

  const pesan = document.querySelector("#pesan-kosong");
  if (pesan) pesan.style.display = cards.length && !ada ? "block" : "none";
}

if (searchBtn && searchForm && searchInput) {
  searchBtn.addEventListener("click", (e) => {
    e.preventDefault();
    searchForm.classList.toggle("active");
    if (searchForm.classList.contains("active")) searchInput.focus();
  });

  document.addEventListener("click", (e) => {
    if (!searchBtn.contains(e.target) && !searchForm.contains(e.target)) {
      searchForm.classList.remove("active");
    }
  });

  searchInput.addEventListener("input", () => saring(searchInput.value));

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !document.querySelector(KARTU)) {
      location.href =
        "daftarkisah.html?cari=" + encodeURIComponent(searchInput.value);
    }
  });

  const cari = new URLSearchParams(location.search).get("cari");
  if (cari) {
    searchInput.value = cari;
    searchForm.classList.add("active");
    saring(cari);
  }
}

const starBtn = document.querySelector("#star");
const favoritModal = document.querySelector("#favorit-modal");
const closeFavoritBtn = document.querySelector("#close-favorit");
const favoritList = document.querySelector("#favorit-list");

const diSubfolderHtml = location.pathname.includes("/html/");

function ambilFavorit() {
  try {
    return JSON.parse(localStorage.getItem("kisahFavorit")) || [];
  } catch (e) {
    return [];
  }
}

function simpanFavorit(data) {
  try {
    localStorage.setItem("kisahFavorit", JSON.stringify(data));
  } catch (e) {}
}

function normalisasiPath(path) {
  if (!path) return "";
  return path.replace(/^\.\.\//, "");
}

function sesuaikanPathTampil(path) {
  if (!path || path.startsWith("#") || path.startsWith("http")) return path;
  return diSubfolderHtml ? "../" + path : path;
}

function inisialisasiKartuFavorit() {
  const daftar = ambilFavorit();

  document.querySelectorAll(KARTU).forEach((card) => {
    const judulEl = card.querySelector("h3");
    if (!judulEl) return;

    const id =
      card.getAttribute("data-id") ||
      judulEl.innerText.toLowerCase().trim().replace(/\s+/g, "-");
    card.setAttribute("data-id", id);

    let btnFav = card.querySelector(".btn-fav");
    if (!btnFav) {
      btnFav = document.createElement("button");
      btnFav.className = "btn-fav";
      btnFav.type = "button";
      btnFav.title = "Simpan ke Favorit";
      btnFav.innerHTML = `<i data-feather="star"></i>`;
      card.appendChild(btnFav);
    }

    const aktif = daftar.some((item) => item.id === id);
    btnFav.classList.toggle("aktif", aktif);

    btnFav.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleFavorit(card, id);
    };
  });

  feather.replace();
}

function toggleFavorit(card, id) {
  let daftar = ambilFavorit();
  const index = daftar.findIndex((item) => item.id === id);

  if (index === -1) {
    const judul = card.querySelector("h3")?.innerText || "Tanpa Judul";
    const deskripsi = card.querySelector("p")?.innerText || "";
    const gambar = normalisasiPath(
      card.querySelector("img")?.getAttribute("src"),
    );
    const link = normalisasiPath(
      card.querySelector("a.cta")?.getAttribute("href"),
    );

    daftar.push({ id, judul, deskripsi, gambar, link });
  } else {
    daftar.splice(index, 1);
  }

  simpanFavorit(daftar);
  perbaruiIkonBintang();
  renderModalFavorit();
}

function perbaruiIkonBintang() {
  const daftar = ambilFavorit();
  document.querySelectorAll(KARTU).forEach((card) => {
    const id = card.getAttribute("data-id");
    const btnFav = card.querySelector(".btn-fav");
    if (btnFav) {
      btnFav.classList.toggle(
        "aktif",
        daftar.some((item) => item.id === id),
      );
    }
  });
}

function renderModalFavorit() {
  if (!favoritList) return;
  const daftar = ambilFavorit();
  favoritList.innerHTML = "";

  if (daftar.length === 0) {
    favoritList.innerHTML =
      '<p class="favorit-kosong">Belum ada kisah favorit. Klik ikon bintang pada kartu kisah untuk menyimpannya.</p>';
    return;
  }

  daftar.forEach((item) => {
    const el = document.createElement("div");
    el.className = "favorit-item";
    el.innerHTML = `
      <img src="${sesuaikanPathTampil(item.gambar)}" alt="${item.judul}" />
      <div class="favorit-item-info">
        <h4>${item.judul}</h4>
        <p>${item.deskripsi}</p>
        <div class="favorit-item-aksi">
          <a href="${sesuaikanPathTampil(item.link)}" class="cta-kecil">Baca Kisah</a>
          <button type="button" class="btn-hapus-fav" data-id="${item.id}">Hapus</button>
        </div>
      </div>
    `;
    favoritList.appendChild(el);
  });

  favoritList.querySelectorAll(".btn-hapus-fav").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idHapus = btn.getAttribute("data-id");
      const sisa = ambilFavorit().filter((item) => item.id !== idHapus);
      simpanFavorit(sisa);
      perbaruiIkonBintang();
      renderModalFavorit();
    });
  });
}

if (starBtn) {
  starBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (favoritModal) {
      renderModalFavorit();
      favoritModal.classList.add("active");
    }
  });
}

if (closeFavoritBtn && favoritModal) {
  closeFavoritBtn.addEventListener("click", () => {
    favoritModal.classList.remove("active");
  });
}

window.addEventListener("click", (e) => {
  if (favoritModal && e.target === favoritModal) {
    favoritModal.classList.remove("active");
  }
});

inisialisasiKartuFavorit();
