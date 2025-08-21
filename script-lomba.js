// ====== KONFIGURASI ======
const API_KEY = "AIzaSyCmySD0x-U3FwPo2BHo6ta9naj3_-7DcDY"; // ganti dengan API key milikmu
const FOLDER_ID = "1oo6U_k-qJGQwvT6N2FcODwS5oQy3_8Ul";

const grid = document.getElementById('grid');
const searchInput = document.getElementById('search');
const typeFilter = document.getElementById('typeFilter');
const reloadBtn = document.getElementById('reloadBtn');

const lightbox = document.getElementById('lightbox');
const lbFrame = document.getElementById('lbFrame');
const lbTitle = document.getElementById('lbTitle');
const fsBtn = document.getElementById('fsBtn');
const closeBtn = document.getElementById('closeBtn');

let allItems = [];

function driveThumbnail(id) {
    return `https://drive.google.com/thumbnail?id=${id}`;
}
function driveImage(id) {
    return `https://drive.google.com/uc?export=view&id=${id}`;
}
function driveVideoPreview(id) {
    return `https://drive.google.com/file/d/${id}/preview`;
}

async function fetchFolderFiles(queryName = "", type = "all") {
    grid.innerHTML = "";
    allItems = [];

    let pageToken = undefined;
    const base = 'https://www.googleapis.com/drive/v3/files';
    const fields = 'nextPageToken, files(id, name, mimeType, thumbnailLink)';

    const qParts = [
        `'${FOLDER_ID}' in parents`,
        'trashed = false',
    ];
    if (type === 'image') qParts.push("mimeType contains 'image/'");
    if (type === 'video') qParts.push("mimeType contains 'video/'");
    if (queryName && queryName.trim()) {
        const esc = queryName.replace(/['\\]/g, '\\$&');
        qParts.push(`name contains '${esc}'`);
    }

    do {
        const params = new URLSearchParams({
            key: API_KEY,
            q: qParts.join(' and '),
            pageSize: '1000',
            fields,
        });
        if (pageToken) params.set('pageToken', pageToken);

        const url = `${base}?${params.toString()}`;
        const res = await fetch(url);
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Gagal memuat: ${res.status} - ${text}`);
        }
        const data = await res.json();
        pageToken = data.nextPageToken;

        const files = (data.files || []).filter(f => f.mimeType?.startsWith('image/') || f.mimeType?.startsWith('video/'));
        allItems.push(...files);
    } while (pageToken);

    renderGrid(allItems);
}

function renderGrid(list) {
    if (!list.length) {
        grid.innerHTML = `<div style="grid-column:1/-1; opacity:.7">Tidak ada file foto/video di folder ini atau akses belum publik.</div>`;
        return;
    }

    const frag = document.createDocumentFragment();
    list.forEach(file => {
        const isImage = file.mimeType.startsWith('image/');
        const card = document.createElement('div');
        card.className = 'item';
        card.dataset.id = file.id;
        card.dataset.name = file.name;
        card.dataset.type = isImage ? 'image' : 'video';

        const img = document.createElement('img');
        img.className = 'thumb';
        img.alt = file.name;
        img.loading = 'lazy';
        img.referrerPolicy = 'no-referrer';
        img.src = file.thumbnailLink || driveThumbnail(file.id);

        const badge = document.createElement('div');
        badge.className = 'badge';
        badge.textContent = isImage ? 'FOTO' : 'VIDEO';

        const label = document.createElement('div');
        label.className = 'label';
        label.textContent = file.name;

        card.appendChild(img);
        card.appendChild(badge);

        card.addEventListener('click', () => openLightbox(file));
        frag.appendChild(card);
    });

    grid.innerHTML = '';
    grid.appendChild(frag);
}

function openLightbox(file) {
    lbTitle.textContent = file.name;
    lbFrame.innerHTML = '';
    const isImage = file.mimeType.startsWith('image/');

    if (isImage) {
        const el = document.createElement('img');
        // Gunakan URL yang lebih stabil untuk gambar
        el.src = `https://drive.google.com/thumbnail?id=${file.id}&sz=w1920-h1080`;
        el.alt = file.name;
        el.referrerPolicy = 'no-referrer';
        el.style.maxHeight = "100vh";
        el.style.maxWidth = "100vw";
        el.style.objectFit = "contain";
        
        // Tambahkan event listener untuk error handling
        el.onerror = function() {
            console.error('Gagal memuat gambar:', file.name);
            // Fallback ke URL alternatif
            this.src = `https://drive.google.com/uc?export=view&id=${file.id}`;
        };
        
        lbFrame.appendChild(el);
    } else {
        const el = document.createElement('video');
        el.src = `https://drive.google.com/uc?export=view&id=${file.id}`;
        el.controls = true;
        el.autoplay = true;
        el.style.maxHeight = "100vh";
        el.style.maxWidth = "100vw";
        el.style.objectFit = "contain";
        
        // Event listener untuk error handling
        el.onerror = function() {
            console.error('Gagal memuat video:', file.name);
            // Fallback ke preview
            const iframe = document.createElement('iframe');
            iframe.src = `https://drive.google.com/file/d/${file.id}/preview`;
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            lbFrame.innerHTML = '';
            lbFrame.appendChild(iframe);
        };
        
        lbFrame.appendChild(el);
    }

    // Tampilkan lightbox dengan display block
    lightbox.style.display = 'flex';
    lightbox.classList.add('show');
    lightbox.setAttribute('aria-hidden', 'false');
    
    // Debug log
    console.log('Membuka lightbox untuk:', file.name, 'Type:', isImage ? 'image' : 'video');
}


function closeLightbox() {
    lightbox.style.display = 'none';
    lightbox.classList.remove('show');
    lightbox.setAttribute('aria-hidden', 'true');
    lbFrame.innerHTML = '';
    if (document.fullscreenElement) document.exitFullscreen?.();
}

function requestNativeFullscreen(el) {
    const fn = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    if (fn) try { fn.call(el); } catch (e) { }
}

fsBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) requestNativeFullscreen(lightbox); else document.exitFullscreen?.();
});
closeBtn.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') applyFilter();
});
typeFilter.addEventListener('change', applyFilter);
reloadBtn.addEventListener('click', () => fetchFolderFiles(searchInput.value, typeFilter.value));

function applyFilter() {
    const term = searchInput.value.trim().toLowerCase();
    const type = typeFilter.value;
    const filtered = allItems.filter(f => {
        const byType = (type === 'all') || f.mimeType.startsWith(type + '/');
        const byName = !term || (f.name.toLowerCase().includes(term));
        return byType && byName;
    });
    renderGrid(filtered);
}

// Tambahan: Cek apakah API key valid
fetchFolderFiles().catch(err => {
    console.error('Error loading files:', err);
    grid.innerHTML = `<div style="grid-column:1/-1; color:#ff6b6b; padding:20px;">
        Error: ${err.message}<br>
        Pastikan folder Google Drive sudah di-set ke "Anyone with the link can view"
    </div>`;
});
