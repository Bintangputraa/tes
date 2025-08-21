// ===== KONFIGURASI =====
const API_KEY = "AIzaSyCmySD0x-U3FwPo2BHo6ta9naj3_-7DcDY"; // ganti dengan API Key kamu
const FOLDER_ID_LOMBA = "1oo6U_k-qJGQwvT6N2FcODwS5oQy3_8Ul";      // isi dengan ID folder Lomba 17an
const FOLDER_ID_TIRAKATAN = "15AQiorluoSWeNv63AzeoPFuV7kI2guJ3"; // Tirakatan 2025

// ===== UTILITAS =====
function driveThumbnail(id) {
    return `https://drive.google.com/thumbnail?id=${id}&sz=w600`;
}
function driveImage(id) {
    return `https://drive.google.com/uc?export=view&id=${id}`;
}

// ===== GALERI GENERIK =====
function initGallery(prefix, folderId) {
    const grid = document.getElementById(`grid-${prefix}`);
    const searchInput = document.getElementById(`search-${prefix}`);
    const typeFilter = document.getElementById(`typeFilter-${prefix}`);
    const reloadBtn = document.getElementById(`reloadBtn-${prefix}`);
    const lightbox = document.getElementById(`lightbox-${prefix}`);
    const lbFrame = document.getElementById(`lbFrame-${prefix}`);
    const lbTitle = document.getElementById(`lbTitle-${prefix}`);
    const fsBtn = document.getElementById(`fsBtn-${prefix}`);
    const closeBtn = document.getElementById(`closeBtn-${prefix}`);

    let allItems = [];

    // ===== Fetch dari Google Drive =====
    async function fetchFiles() {
        grid.innerHTML = "<p>Loading...</p>";
        allItems = [];

        let pageToken;
        do {
            const params = new URLSearchParams({
                key: API_KEY,
                q: `'${folderId}' in parents and trashed=false`,
                pageSize: "1000",
                fields: "nextPageToken, files(id, name, mimeType, thumbnailLink)",
            });
            if (pageToken) params.set("pageToken", pageToken);

            const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`);
            const data = await res.json();
            pageToken = data.nextPageToken;

            const files = (data.files || []).filter(f =>
                f.mimeType.startsWith("image/") || f.mimeType.startsWith("video/")
            );
            allItems.push(...files);
        } while (pageToken);

        applyFilter(); // render awal
    }

    // ===== Render grid =====
    function renderGrid(list) {
        grid.innerHTML = "";
        if (!list.length) {
            grid.innerHTML = `<div style="grid-column:1/-1; color:#ccc">Tidak ada file</div>`;
            return;
        }
        list.forEach(file => {
            const card = document.createElement("div");
            card.className = "item";
            card.innerHTML = `
        <img class="thumb" src="${file.thumbnailLink || driveThumbnail(file.id)}" alt="${file.name}">
        <div class="badge">${file.mimeType.startsWith("image/") ? "FOTO" : "VIDEO"}</div>`;
            card.onclick = () => openLightbox(file);
            grid.appendChild(card);
        });
    }

    // ===== Lightbox =====
    function openLightbox(file) {
        lbTitle.textContent = file.name;
        lbFrame.innerHTML = "";

        if (file.mimeType.startsWith("image/")) {
            const img = document.createElement("img");
            img.src = `https://drive.google.com/thumbnail?id=${file.id}&sz=w1920-h1080`;
            img.alt = file.name;
            img.style.maxWidth = "100%";
            img.style.maxHeight = "100%";
            img.style.objectFit = "contain";

            // fallback kalau thumbnail error
            img.onerror = () => {
                img.src = driveImage(file.id);
            };

            lbFrame.appendChild(img);
        } else if (file.mimeType.startsWith("video/")) {
            const videoEl = document.createElement("video");
            videoEl.src = driveImage(file.id);
            videoEl.controls = true;
            videoEl.autoplay = true;
            videoEl.style.maxWidth = "100%";
            videoEl.style.maxHeight = "100%";
            videoEl.style.objectFit = "contain";

            // fallback iframe preview
            videoEl.onerror = () => {
                lbFrame.innerHTML = `
          <iframe src="https://drive.google.com/file/d/${file.id}/preview"
                  width="100%" height="100%" allow="autoplay" frameborder="0"></iframe>
        `;
            };

            lbFrame.appendChild(videoEl);
        }

        lightbox.style.display = "flex";
    }

    function closeLightbox() {
        lightbox.style.display = "none";
        lbFrame.innerHTML = "";
    }

    // ===== Filter & Search =====
    function applyFilter() {
        const term = searchInput.value.trim().toLowerCase();
        const type = typeFilter.value;

        const filtered = allItems.filter(f => {
            const byType = (type === "all") || f.mimeType.startsWith(type + "/");
            const byName = !term || f.name.toLowerCase().includes(term);
            return byType && byName;
        });

        renderGrid(filtered);
    }

    // ===== Event Listener =====
    searchInput.addEventListener("input", applyFilter);   // langsung saat mengetik
    typeFilter.addEventListener("change", applyFilter);  // langsung saat ganti dropdown
    reloadBtn.addEventListener("click", fetchFiles);

    closeBtn.onclick = closeLightbox;
    fsBtn.onclick = () => {
        if (!document.fullscreenElement) lightbox.requestFullscreen?.();
        else document.exitFullscreen?.();
    };
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });
    lightbox.addEventListener("click", e => { if (e.target === lightbox) closeLightbox(); });

    // ===== Load pertama =====
    fetchFiles();
}

// ===== Inisialisasi semua galeri =====
document.addEventListener("DOMContentLoaded", () => {
    initGallery("lomba", FOLDER_ID_LOMBA);
    initGallery("tirakatan", FOLDER_ID_TIRAKATAN);
});
