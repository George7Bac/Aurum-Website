const songs = [
  { title: 'Blinding Lights', artist: 'The Weeknd', dur: '3:20', emoji: '🌙', bg: 'g1', liked: true, src: 'audio/blinding_lights.mp3' },
  { title: 'Flowers', artist: 'Miley Cyrus', dur: '3:21', emoji: '🌸', bg: 'g2', liked: false, src: 'audio/flowers.mp3' },
  { title: 'As It Was', artist: 'Harry Styles', dur: '2:37', emoji: '🎸', bg: 'g7', liked: true, src: 'audio/as_it_was.mp3' },
  { title: 'Levitating', artist: 'Dua Lipa', dur: '3:24', emoji: '✨', bg: 'g6', liked: false, src: 'audio/levitating.mp3' },
  { title: 'Peaches', artist: 'Justin Bieber', dur: '3:19', emoji: '🍑', bg: 'g8', liked: false, src: 'audio/peaches.mp3' },
  { title: 'Stay', artist: 'Kid Laroi & Justin Bieber', dur: '2:21', emoji: '💫', bg: 'g5', liked: true, src: 'audio/stay.mp3' },
  { title: 'good 4 u', artist: 'Olivia Rodrigo', dur: '2:58', emoji: '💚', bg: 'g2', liked: false, src: 'audio/good4u.mp3' },
  { title: 'Heat Waves', artist: 'Glass Animals', dur: '3:59', emoji: '🌊', bg: 'g4', liked: true, src: 'audio/heat_waves.mp3' },
];

const library = [
  { name: 'Liked Songs', meta: 'Playlist', emoji: '💛', bg: 'g5', round: false, pinned: true, type: 'playlists' },
  { name: 'Jazz at Midnight', meta: 'Playlist · 34 songs', emoji: '🎷', bg: 'g4', round: false, pinned: true, type: 'playlists' },
  { name: 'Miles Davis', meta: 'Artist', emoji: '🎺', bg: 'g9', round: true, pinned: false, type: 'artists' },
  { name: 'Kind of Blue', meta: 'Album · Miles Davis', emoji: '🎶', bg: 'g4', round: false, pinned: false, type: 'albums' },
  { name: 'Folklore', meta: 'Album · Taylor Swift', emoji: '🍂', bg: 'g2', round: false, pinned: false, type: 'albums' },
  { name: 'Huberman Lab', meta: 'Podcast · Andrew Huberman', emoji: '🧠', bg: 'g2', round: false, pinned: false, type: 'podcasts' },
  { name: 'Focus Mode', meta: 'Playlist · 22 songs', emoji: '🎹', bg: 'g2', round: false, pinned: false, type: 'playlists' },
  { name: 'The Weeknd', meta: 'Artist', emoji: '🌙', bg: 'g1', round: true, pinned: false, type: 'artists' },
  { name: 'Chill Vibes', meta: 'Playlist · 57 songs', emoji: '🌊', bg: 'g4', round: false, pinned: false, type: 'playlists' },
  { name: 'Workout Mix', meta: 'Playlist · 40 songs', emoji: '🔥', bg: 'g3', round: false, pinned: false, type: 'playlists' },
];

let currentSong = 0;
let isPlaying = false;
let isLiked = false;
let isShuffle = false;
let isRepeat = false;
let currentLibraryFilter = 'all';

let userPlaylists = [];
let pendingSongToAdd = -1;

// ====== SISTEM AKUN & AUTENTIKASI ======
let currentUser = null;

function initAuth() {
  const savedUser = localStorage.getItem('aurum_active_user');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    showMainApp();
  } else {
    switchAuth('register-screen');
  }
}

function switchAuth(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
  document.getElementById('main-bottom-nav').style.display = 'none';
  document.getElementById('now-playing-bar').style.display = 'none';
}

function handleRegister() {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const age = document.getElementById('reg-age').value.trim();
  const gender = document.querySelector('input[name="reg-gender"]:checked')?.value;
  const dob = document.getElementById('reg-dob').value;
  const pass = document.getElementById('reg-pass').value;

  // Validasi data tidak boleh kosong
  if (!name || !email || !age || !gender || !dob || !pass) {
    showToast('⚠️ Lengkapi semua data pendaftaran!');
    return;
  }

  const userData = { name, email, age, gender, dob, pass };
  // Menggunakan email sebagai key unik di localStorage
  localStorage.setItem('aurum_account_' + email, JSON.stringify(userData));
  
  showToast('✅ Pendaftaran berhasil! Silakan Login.');
  
  // Reset input form pendaftaran
  document.getElementById('reg-name').value = '';
  document.getElementById('reg-email').value = '';
  document.getElementById('reg-age').value = '';
  document.getElementById('reg-dob').value = '';
  document.getElementById('reg-pass').value = '';
  const checkedRadio = document.querySelector('input[name="reg-gender"]:checked');
  if (checkedRadio) checkedRadio.checked = false;

  switchAuth('login-screen');
}

function handleLogin() {
  const email = document.getElementById('log-email').value.trim().toLowerCase();
  const pass = document.getElementById('log-pass').value;

  if (!email || !pass) {
    showToast('⚠️ Masukkan email dan password!');
    return;
  }

  const dataString = localStorage.getItem('aurum_account_' + email);
  if (!dataString) {
    showToast('❌ Akun tidak ditemukan.');
    return;
  }

  const userData = JSON.parse(dataString);
  if (userData.pass !== pass) {
    showToast('❌ Password salah.');
    return;
  }

  currentUser = userData;
  localStorage.setItem('aurum_active_user', JSON.stringify(currentUser));
  
  showToast(`Selamat datang kembali, ${currentUser.name.split(' ')[0]}!`);
  showMainApp();
}

function handleLogout() {
  localStorage.removeItem('aurum_active_user');
  currentUser = null;
  if (isPlaying) togglePlay(); 
  switchAuth('login-screen');
  document.getElementById('log-email').value = '';
  document.getElementById('log-pass').value = '';
  showToast('Anda telah Log Out.');
}

function showMainApp() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('home-screen').classList.add('active');
  document.getElementById('main-bottom-nav').style.display = 'flex';
  
  const firstName = currentUser.name.split(' ')[0];
  const initials = currentUser.name.substring(0, 2).toUpperCase();

  // Menyesuaikan sapaan di home page sesuai instruksi: "Hi, .... (nama user)"
  document.getElementById('greeting-text').innerHTML = `Hi, ${firstName} <span style="font-size:20px;">👋</span>`;
  document.getElementById('home-avatar').textContent = initials;
  document.getElementById('profile-avatar-large').textContent = initials;
  document.getElementById('rep-avatar').textContent = initials;
  document.getElementById('rep-name').textContent = currentUser.name;
  
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.getElementById('nav-home').classList.add('active');
  
  if (audio.src) {
    document.getElementById('now-playing-bar').style.display = 'flex';
  }
}

// ====== PROFILE INTERACTIVE CONTROLS ======
function openProfile() {
  document.getElementById('prof-name').value = currentUser.name;
  document.getElementById('prof-email').value = currentUser.email;
  document.getElementById('prof-age').value = currentUser.age;
  document.getElementById('prof-dob').value = currentUser.dob;
  document.getElementById('prof-pass').value = ''; 
  
  const radios = document.getElementsByName('prof-gender');
  for (let r of radios) { 
    if (r.value === currentUser.gender) r.checked = true; 
  }

  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('profile-screen').classList.add('active');
}

function closeProfile() {
  document.getElementById('profile-screen').classList.remove('active');
  document.getElementById('home-screen').classList.add('active');
}

function saveProfile() {
  const name = document.getElementById('prof-name').value.trim();
  const age = document.getElementById('prof-age').value.trim();
  const dob = document.getElementById('prof-dob').value;
  const gender = document.querySelector('input[name="prof-gender"]:checked')?.value;
  const newPass = document.getElementById('prof-pass').value;

  if (!name || !age || !dob || !gender) {
    showToast('⚠️ Data tidak boleh ada yang kosong!'); 
    return;
  }

  currentUser.name = name;
  currentUser.age = age;
  currentUser.dob = dob;
  currentUser.gender = gender;
  if (newPass) currentUser.pass = newPass;

  localStorage.setItem('aurum_account_' + currentUser.email, JSON.stringify(currentUser));
  localStorage.setItem('aurum_active_user', JSON.stringify(currentUser));

  showToast('✅ Data profile berhasil diperbarui!');
  showMainApp();
}

// ====== AUDIO PLAYER ENGINE ======
const audio = new Audio();

function buildSongList() {
  const el = document.getElementById('recommended-songs');
  el.innerHTML = songs.map((s, i) => `
    <div class="song-row ${i === currentSong && isPlaying ? 'playing' : ''}" onclick="playSong(${i})">
      <div class="song-art-sm ${s.bg}">${s.emoji}</div>
      <div class="song-info">
        <div class="song-title ${i === currentSong ? 'gold' : ''}">${s.title}</div>
        <div class="song-artist">${s.artist}</div>
      </div>
      <div class="song-dur">${s.dur}</div>
    </div>
  `).join('');
}

function buildLibrary(filter = currentLibraryFilter) {
  const el = document.getElementById('library-list');
  const filtered = filter === 'all' ? library : library.filter(l => l.type === filter);

  let html = '';
  if (filter === 'all' || filter === 'playlists') {
    userPlaylists.forEach((pl) => {
      html += `
        <div class="lib-item" onclick="openCustomPlaylist(${pl.id})">
          <div class="lib-art ${pl.bg}">${pl.emoji}</div>
          <div class="lib-info">
            <div class="lib-name">${pl.name}</div>
            <div class="lib-meta">Playlist · ${pl.songs.length} songs</div>
          </div>
          <button class="delete-pl-btn" onclick="event.stopPropagation(); deletePlaylist(${pl.id}, '${pl.name}')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      `;
    });
  }

  filtered.forEach((l) => {
    if (l.name === 'Liked Songs') {
      const likedSongs = songs.filter(s => s.liked);
      html += `
        <div class="lib-item" onclick="openLikedSongsPage()">
          <div class="lib-art ${l.bg}">${l.emoji}</div>
          <div class="lib-info">
            <div class="lib-name">${l.name}</div>
            <div class="lib-meta">Playlist · ${likedSongs.length} songs</div>
          </div>
          <svg class="lib-pin" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        </div>
      `;
    } else {
      html += `
        <div class="lib-item" onclick="playFromCard('${l.name}','${l.emoji}','${l.meta}')">
          <div class="lib-art ${l.round ? 'round' : ''} ${l.bg}">${l.emoji}</div>
          <div class="lib-info">
            <div class="lib-name">${l.name}</div>
            <div class="lib-meta">${l.meta}</div>
          </div>
        </div>
      `;
    }
  });
  el.innerHTML = html;
}

function filterLib(el, filter) {
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  currentLibraryFilter = filter;
  buildLibrary();
}

function openCreatePlaylistOnly() {
  const modal = document.getElementById('playlist-modal');
  const content = document.getElementById('modal-content-area');
  content.innerHTML = `
    <div class="modal-title">Create New Playlist</div>
    <input type="text" id="new-playlist-name" class="modal-input" placeholder="My Awesome Playlist">
    <div class="modal-btns">
      <button class="modal-btn btn-cancel" onclick="closeModal()">Cancel</button>
      <button class="modal-btn btn-save" onclick="saveNewPlaylist()">Create</button>
    </div>
  `;
  modal.classList.add('active');
  setTimeout(() => document.getElementById('new-playlist-name').focus(), 100);
}

function saveNewPlaylist() {
  const name = document.getElementById('new-playlist-name').value.trim();
  if (!name) { 
    closeModal(); // Pop-up langsung ditutup
    showToast('Nama playlist tidak boleh kosong!'); 
    return; 
  }
  
  const isDuplicate = userPlaylists.some(pl => pl.name.toLowerCase() === name.toLowerCase());
  
  if (isDuplicate) {
    closeModal(); // Pop-up langsung ditutup jika nama dobel
    showToast('⚠️ Nama playlist sudah digunakan!');
    return; 
  }

  userPlaylists.push({ id: Date.now(), name: name, songs: [], emoji: '🎵', bg: 'g9' });
  closeModal();
  showToast(`Playlist "${name}" berhasil dibuat!`);
  buildLibrary();
}

function openPlaylistModal(songIndex) {
  pendingSongToAdd = songIndex;
  const modal = document.getElementById('playlist-modal');
  const content = document.getElementById('modal-content-area');
  content.innerHTML = `
    <div class="modal-title">Add to Playlist</div>
    <div style="display: flex; gap: 8px; margin-bottom: 16px; align-items: center;">
      <input type="text" id="new-playlist-name" class="modal-input" style="margin-bottom: 0; flex: 1;" placeholder="New Playlist Name...">
      <button class="modal-btn btn-save" onclick="saveNewPlaylistAndAddSong()">Create & Add</button>
    </div>
    ${userPlaylists.length > 0 ? `
      <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">Or add to existing:</div>
      <div style="max-height: 160px; overflow-y: auto; margin-bottom: 16px; border-top: 1px solid rgba(255,255,255,0.05);">
        ${userPlaylists.map(p => `
          <div class="modal-playlist-item" onclick="addSongToPlaylist(${p.id})">
            <div class="modal-playlist-icon ${p.bg}">${p.emoji}</div>
            <div style="color:var(--text-primary); font-size:14px; font-weight:500;">${p.name}</div>
          </div>
        `).join('')}
      </div>
    ` : ``}
    <div class="modal-btns"><button class="modal-btn btn-cancel" onclick="closeModal()">Close</button></div>
  `;
  modal.classList.add('active');
}

function saveNewPlaylistAndAddSong() {
  const name = document.getElementById('new-playlist-name').value.trim();
  if (!name) {
    closeModal(); // Pop-up langsung ditutup
    showToast('Nama playlist tidak boleh kosong!');
    return;
  }

  const isDuplicate = userPlaylists.some(pl => pl.name.toLowerCase() === name.toLowerCase());
  
  if (isDuplicate) {
    closeModal(); // Pop-up langsung ditutup jika nama dobel
    showToast('⚠️ Nama playlist sudah digunakan!');
    return;
  }

  userPlaylists.push({ id: Date.now(), name: name, songs: [pendingSongToAdd], emoji: '🎵', bg: 'g9' });
  closeModal();
  showToast(`Berhasil menambahkan ke "${name}"`);
  buildLibrary();
}

function addSongToPlaylist(playlistId) {
  const pl = userPlaylists.find(p => p.id === playlistId);
  if (pl) {
    if (!pl.songs.includes(pendingSongToAdd)) {
      pl.songs.push(pendingSongToAdd);
      showToast(`Added to "${pl.name}"`);
    } else {
      showToast(`Lagu sudah ada di "${pl.name}"`);
    }
  }
  closeModal();
  buildLibrary();
}

function deletePlaylist(playlistId, playlistName) {
  if (confirm(`Apakah Anda yakin ingin menghapus playlist "${playlistName}"?`)) {
    userPlaylists = userPlaylists.filter(p => p.id !== playlistId);
    showToast(`Playlist "${playlistName}" dihapus.`);
    buildLibrary();
  }
}

function closeModal() { document.getElementById('playlist-modal').classList.remove('active'); }

function openCustomPlaylist(id) {
  const pl = userPlaylists.find(p => p.id === id);
  if (!pl) return;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('custom-playlist-screen').classList.add('active');
  document.getElementById('custom-playlist-title').textContent = pl.name;

  const listEl = document.getElementById('custom-playlist-list');
  if (pl.songs.length === 0) {
    listEl.innerHTML = '<div style="text-align:center; padding-top:40px; color:var(--text-muted);">Playlist kosong.</div>';
    return;
  }
  listEl.innerHTML = pl.songs.map(songIdx => {
    const s = songs[songIdx];
    return `
      <div class="song-row ${songIdx === currentSong && isPlaying ? 'playing' : ''}" onclick="playSong(${songIdx})">
        <div class="song-art-sm ${s.bg}">${s.emoji}</div>
        <div class="song-info">
          <div class="song-title ${songIdx === currentSong ? 'gold' : ''}">${s.title}</div>
          <div class="song-artist">${s.artist}</div>
        </div>
        <div class="song-dur">${s.dur}</div>
      </div>
    `;
  }).join('');
}

function openLikedSongsPage() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('liked-songs-screen').classList.add('active');
  buildLikedSongsList();
}

function closePageToLibrary(screenId) {
  document.getElementById(screenId).classList.remove('active');
  document.getElementById('library-screen').classList.add('active');
}

function buildLikedSongsList() {
  const el = document.getElementById('liked-songs-list');
  const likedSongs = songs.filter(s => s.liked);
  if (likedSongs.length === 0) {
    el.innerHTML = `<div style="text-align:center; padding-top:40px; color:var(--text-muted);">Belum ada lagu favorit.</div>`;
    return;
  }
  el.innerHTML = likedSongs.map(s => {
    const originalIndex = songs.findIndex(orig => orig.title === s.title);
    return `
      <div class="song-row ${originalIndex === currentSong && isPlaying ? 'playing' : ''}" onclick="playSong(${originalIndex})">
        <div class="song-art-sm ${s.bg}">${s.emoji}</div>
        <div class="song-info">
          <div class="song-title ${originalIndex === currentSong ? 'gold' : ''}">${s.title}</div>
          <div class="song-artist">${s.artist}</div>
        </div>
        <div class="song-dur">${s.dur}</div>
      </div>
    `;
  }).join('');
}

function playSong(index) {
  currentSong = index;
  const s = songs[index];
  isLiked = s.liked;
  audio.src = s.src;
  updateNowPlaying(s);
  updatePlayerUI(s);
  
  audio.play().then(() => {
    isPlaying = true;
    updatePlayPauseIcons();
    buildSongList();
    buildLibrary();
    buildLikedSongsList();
    
    const activeCustomPage = document.querySelector('#custom-playlist-screen.active');
    if (activeCustomPage) {
       const activeTitle = document.getElementById('custom-playlist-title').textContent;
       const pl = userPlaylists.find(p => p.name === activeTitle);
       if (pl) openCustomPlaylist(pl.id);
    }
    document.getElementById('now-playing-bar').style.display = 'flex';
  }).catch(err => {
    showToast('⚠️ Gagal memutar lagu. Cek file audio-nya!');
  });
}

function playFromCard(name, emoji, artist) { showToast(`▶ Demo: Mainkan langsung dari list lagu di bawah.`); }
function updateNowPlaying(s) { document.getElementById('np-art').textContent = s.emoji; document.getElementById('np-art').className = `np-art ${s.bg}`; document.getElementById('np-title').textContent = s.title; document.getElementById('np-artist').textContent = s.artist; updateHeartUI(); }
function updatePlayerUI(s) { document.getElementById('player-art').textContent = s.emoji; document.getElementById('player-art').className = `player-art ${s.bg}`; document.getElementById('player-title').textContent = s.title; document.getElementById('player-artist').textContent = s.artist; document.getElementById('time-total').textContent = s.dur; updateHeartUI(); }

function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${m}:${sec.toString().padStart(2,'0')}`;
}

audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  document.getElementById('seek-fill').style.width = pct + '%';
  document.getElementById('seek-thumb').style.left = pct + '%';
  document.getElementById('np-progress').style.width = pct + '%';
  document.getElementById('time-current').textContent = formatTime(audio.currentTime);
});

audio.addEventListener('ended', () => { if (isRepeat) { audio.currentTime = 0; audio.play(); } else { nextTrack(); } });

function togglePlay() {
  if (!audio.src) return;
  if (isPlaying) audio.pause(); else audio.play();
  isPlaying = !isPlaying;
  updatePlayPauseIcons();
  buildSongList();
  buildLikedSongsList();
}

function updatePlayPauseIcons() {
  const playIconPath = '<polygon points="5 3 19 12 5 21 5 3"/>';
  const pauseIconPath = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
  if (isPlaying) {
    document.getElementById('np-play-icon').innerHTML = pauseIconPath;
    document.getElementById('main-play-icon').innerHTML = pauseIconPath;
    document.getElementById('player-art').classList.add('spinning');
  } else {
    document.getElementById('np-play-icon').innerHTML = playIconPath;
    document.getElementById('main-play-icon').innerHTML = playIconPath;
    document.getElementById('player-art').classList.remove('spinning');
  }
}

function nextTrack() { if (songs.length === 0) return; currentSong = isShuffle ? Math.floor(Math.random() * songs.length) : (currentSong + 1) % songs.length; playSong(currentSong); }
function prevTrack() { if (audio.currentTime > 3) { audio.currentTime = 0; return; } if (songs.length === 0) return; currentSong = (currentSong - 1 + songs.length) % songs.length; playSong(currentSong); }

function toggleLike() {
  isLiked = !isLiked;
  if (currentSong >= 0) songs[currentSong].liked = isLiked;
  updateHeartUI();
  showToast(isLiked ? '💛 Added to Liked Songs' : '🤍 Removed from Liked Songs');
  buildSongList(); buildLibrary(); buildLikedSongsList();
}

function updateHeartUI() {
  const fill = isLiked ? 'currentColor' : 'none';
  const heartSVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
  const npHeart = document.getElementById('np-heart');
  const playerHeart = document.getElementById('player-heart');
  npHeart.innerHTML = heartSVG; playerHeart.innerHTML = heartSVG;
  if (isLiked) { npHeart.style.color = 'var(--gold)'; playerHeart.style.color = 'var(--gold)'; }
  else { npHeart.style.color = ''; playerHeart.style.color = ''; }
}

function toggleShuffle() { isShuffle = !isShuffle; document.getElementById('shuffle-btn').classList.toggle('active', isShuffle); showToast(isShuffle ? '🔀 Shuffle on' : '🔀 Shuffle off'); }
function toggleRepeat() { isRepeat = !isRepeat; document.getElementById('repeat-btn').classList.toggle('active', isRepeat); showToast(isRepeat ? '🔁 Repeat on' : '🔁 Repeat off'); }
function seekTo(e) { if (!audio.duration) return; const bar = e.currentTarget; const rect = bar.getBoundingClientRect(); const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)); audio.currentTime = pct * audio.duration; }

document.getElementById('vol-slider').addEventListener('input', (e) => { audio.volume = e.target.value / 100; });
function openPlayer() { const ps = document.getElementById('player-screen'); ps.style.display = 'flex'; requestAnimationFrame(() => ps.classList.add('open')); }
function closePlayer() { const ps = document.getElementById('player-screen'); ps.classList.remove('open'); setTimeout(() => { ps.style.display = 'none'; }, 400); }

function switchTab(tab) {
  ['home','search','library','reputation'].forEach(t => {
    const screenEl = document.getElementById(t + '-screen');
    const navEl = document.getElementById('nav-' + t);
    if (screenEl) screenEl.classList.toggle('active', t === tab);
    if (navEl) navEl.classList.toggle('active', t === tab);
  });
  ['liked-songs-screen', 'custom-playlist-screen', 'profile-screen'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });
}

let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

let searchTimer;
function handleSearch(val) {
  clearTimeout(searchTimer);
  const results = document.getElementById('search-results');
  const browse = document.getElementById('browse-section');
  if (!val.trim()) { results.style.display = 'none'; browse.style.display = 'block'; return; }
  searchTimer = setTimeout(() => {
    const q = val.toLowerCase();
    const matches = songs.filter(s => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q));
    browse.style.display = 'none';
    if (matches.length === 0) {
      results.innerHTML = `<div style="text-align:center;padding:40px 0;color:var(--text-muted);">No results for "${val}"</div>`;
    } else {
      results.innerHTML = `<div style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;">Songs</div>` +
        matches.map((s, i) => `
          <div class="song-row" onclick="playSong(${songs.indexOf(s)})">
            <div class="song-art-sm ${s.bg}">${s.emoji}</div>
            <div class="song-info">
              <div class="song-title">${s.title}</div>
              <div class="song-artist">${s.artist}</div>
            </div>
            <div class="song-dur">${s.dur}</div>
          </div>
        `).join('');
    }
    results.style.display = 'block';
  }, 300);
}

buildSongList();
buildLibrary();
initAuth();