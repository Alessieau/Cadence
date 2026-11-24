/**
 * Cadence — Clear Glass Edition
 * Direction Artistique : Verre translucide & Typographie Claude (Anthropic)
 * Persistance permanente dans data.json & localStorage
 * Clic droit activé & Tableaux de suivi des sous-parties
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'cadence_habits_data';
  const NUM_WEEKS = 53;

  // --- Palettes GitHub ---
  const PALETTES = {
    'terracotta': {
      name: 'Claude Terracotta',
      dot: '#E28766',
      l0: 'rgba(255, 255, 255, 0.045)',
      l0_stroke: 'rgba(255, 255, 255, 0.06)',
      l1: '#4E2519',
      l2: '#843B26',
      l3: '#C45837',
      l4: '#E88564'
    },
    'github-green': {
      name: 'GitHub Émeraude',
      dot: '#39D353',
      l0: '#161b22',
      l0_stroke: '#21262d',
      l1: '#0e4429',
      l2: '#006d32',
      l3: '#26a641',
      l4: '#39d353'
    },
    'amber': {
      name: 'Ambre Chaleureux',
      dot: '#E59E4B',
      l0: 'rgba(255, 255, 255, 0.045)',
      l0_stroke: 'rgba(255, 255, 255, 0.06)',
      l1: '#4D3110',
      l2: '#825016',
      l3: '#BF781E',
      l4: '#E59E4B'
    },
    'azure': {
      name: 'Azur & Cristal',
      dot: '#4A9CFF',
      l0: 'rgba(255, 255, 255, 0.045)',
      l0_stroke: 'rgba(255, 255, 255, 0.06)',
      l1: '#1A375C',
      l2: '#265996',
      l3: '#367ED4',
      l4: '#4A9CFF'
    }
  };

  const HABIT_COLORS = {
    'terracotta': { fill: '#E88564', glow: 'rgba(232, 133, 100, 0.35)' },
    'amber': { fill: '#E59E4B', glow: 'rgba(229, 158, 75, 0.35)' },
    'sage': { fill: '#6EA982', glow: 'rgba(110, 169, 130, 0.35)' },
    'azure': { fill: '#4A9CFF', glow: 'rgba(74, 156, 255, 0.35)' },
    'plum': { fill: '#B876A2', glow: 'rgba(184, 118, 162, 0.35)' },
    'emerald': { fill: '#39D353', glow: 'rgba(57, 211, 83, 0.35)' }
  };

  // --- État de l'Application ---
  let state = {
    habits: [],
    logs: {},
    settings: {
      theme: 'glass',
      palette: 'terracotta',
      sound: true
    }
  };

  let selectedHabitId = null;
  let currentFilter = 'all';
  let searchQuery = '';
  let contextMenuHabitId = null;

  // --- Audio Web Synthétisé ---
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playBoomSound() {
    if (!state.settings.sound) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(460, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  function playUncheckSound() {
    if (!state.settings.sound) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(640, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.06);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {}
  }

  // --- Particules Confettis ---
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animFrameId = null;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function triggerCelebration(originX, originY) {
    const colors = ['#E28766', '#FAF5EE', '#E59E4B', '#39D353', '#FFFFFF', '#C45837'];
    const count = 35;
    const startX = originX || window.innerWidth / 2;
    const startY = originY || window.innerHeight / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      particles.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        size: Math.random() * 4 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.025 + 0.02,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 8
      });
    }

    if (!animFrameId) renderParticles();
  }

  function renderParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.alpha -= p.decay;
      p.rotation += p.rotSpeed;

      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    }

    if (particles.length > 0) {
      animFrameId = requestAnimationFrame(renderParticles);
    } else {
      animFrameId = null;
    }
  }

  // --- Gestion des Dates ---
  function getLocalDateStr(dateObj = new Date()) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function parseLocalDateStr(str) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function formatDateFrench(dateStr, includeYear = true) {
    const date = parseLocalDateStr(dateStr);
    const options = {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    };
    if (includeYear) options.year = 'numeric';
    const formatted = date.toLocaleDateString('fr-FR', options);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  // ==========================================================================
  // PERSISTANCE AUTOMATIQUE DANS DATA.JSON ET LOCALSTORAGE
  // ==========================================================================
  async function loadData() {
    const badge = document.getElementById('sync-status-badge');
    let loadedFromServer = false;

    try {
      const res = await fetch('/api/data', { cache: 'no-store' });
      if (res.ok) {
        const remoteData = await res.json();
        if (remoteData && Array.isArray(remoteData.habits) && remoteData.habits.length > 0) {
          state = remoteData;
          loadedFromServer = true;
          if (badge) {
            badge.textContent = '● data.json synchronisé';
            badge.style.color = '#6EDB8F';
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
      }
    } catch (e) {}

    if (!loadedFromServer) {
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) {
        try {
          state = JSON.parse(local);
          if (badge) {
            badge.textContent = '● Sauvegarde locale (data.json en attente)';
            badge.style.color = '#E59E4B';
          }
        } catch (e) {}
      }
    }

    if (!state.settings) state.settings = { theme: 'glass', palette: 'terracotta', sound: true };
    if (!state.logs) state.logs = {};
    if (!state.habits) state.habits = [];

    if (state.habits.length > 0 && !selectedHabitId) {
      selectedHabitId = state.habits[0].id;
    }
  }

  async function saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}

    const badge = document.getElementById('sync-status-badge');
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      });
      if (res.ok) {
        if (badge) {
          badge.textContent = '● data.json synchronisé';
          badge.style.color = '#6EDB8F';
        }
      } else {
        if (badge) {
          badge.textContent = '● Sauvegardé en local';
          badge.style.color = '#E59E4B';
        }
      }
    } catch (e) {
      if (badge) {
        badge.textContent = '● Sauvegardé en local';
        badge.style.color = '#E59E4B';
      }
    }
  }

  // --- Moteur de Calcul des Séries (Streaks) ---
  function computeHabitStreak(habitId) {
    const habitLogs = state.logs[habitId] || {};
    const todayStr = getLocalDateStr();
    let currentStreak = 0;
    let bestStreak = 0;
    let totalCompletions = Object.keys(habitLogs).filter(k => habitLogs[k]).length;

    let checkDate = new Date();
    const todayDone = !!habitLogs[todayStr];
    if (!todayDone) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dStr = getLocalDateStr(checkDate);
      if (habitLogs[dStr]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    const sortedDates = Object.keys(habitLogs).filter(k => habitLogs[k]).sort();
    let tempStreak = 0;
    let lastDateObj = null;

    for (const dStr of sortedDates) {
      const curDateObj = parseLocalDateStr(dStr);
      if (lastDateObj) {
        const diffDays = Math.round((curDateObj - lastDateObj) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      lastDateObj = curDateObj;
      if (tempStreak > bestStreak) bestStreak = tempStreak;
    }

    return { currentStreak, bestStreak, totalCompletions };
  }

  function computeGlobalStats() {
    const todayStr = getLocalDateStr();
    const activeHabits = state.habits.filter(h => !h.archived);
    const activeCount = activeHabits.length;

    let totalCompletions = 0;
    let totalPastYearCompletions = 0;
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);
    const oneYearAgoStr = getLocalDateStr(oneYearAgo);

    for (const h of state.habits) {
      const hLogs = state.logs[h.id] || {};
      for (const [dStr, val] of Object.entries(hLogs)) {
        if (val) {
          totalCompletions++;
          if (dStr >= oneYearAgoStr && dStr <= todayStr) {
            totalPastYearCompletions++;
          }
        }
      }
    }

    let currentStreak = 0;
    let checkDate = new Date();
    const isDayActive = (dStr) => {
      return activeHabits.some(h => state.logs[h.id] && state.logs[h.id][dStr]);
    };

    if (!isDayActive(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dStr = getLocalDateStr(checkDate);
      if (isDayActive(dStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    const allActiveDays = new Set();
    for (const h of activeHabits) {
      const hLogs = state.logs[h.id] || {};
      for (const [dStr, val] of Object.entries(hLogs)) {
        if (val) allActiveDays.add(dStr);
      }
    }
    const sortedDates = Array.from(allActiveDays).sort();
    let bestStreak = 0;
    let tempStreak = 0;
    let lastDateObj = null;

    for (const dStr of sortedDates) {
      const curDateObj = parseLocalDateStr(dStr);
      if (lastDateObj) {
        const diffDays = Math.round((curDateObj - lastDateObj) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      lastDateObj = curDateObj;
      if (tempStreak > bestStreak) bestStreak = tempStreak;
    }

    let last30Opportunities = 30 * (activeCount || 1);
    let last30Completed = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = getLocalDateStr(d);
      for (const h of activeHabits) {
        if (state.logs[h.id] && state.logs[h.id][dStr]) {
          last30Completed++;
        }
      }
    }
    const monthlyRate = activeCount > 0 ? Math.round((last30Completed / last30Opportunities) * 100) : 0;

    return {
      currentStreak,
      bestStreak,
      totalCompletions,
      totalPastYearCompletions,
      monthlyRate
    };
  }

  // ==========================================================================
  // MOTEUR SVG DE LA MATRICE GITHUB (53 COLONNES, 7 LIGNES)
  // ==========================================================================
  function generateGitHubCalendarSVG(habitId = null) {
    const today = new Date();
    const todayStr = getLocalDateStr(today);

    const todayDayOfWeek = today.getDay();
    const endSaturday = new Date(today);
    endSaturday.setDate(today.getDate() + (6 - todayDayOfWeek));

    const startDate = new Date(endSaturday);
    startDate.setDate(endSaturday.getDate() - (NUM_WEEKS * 7 - 1));

    const activeHabits = state.habits.filter(h => !h.archived);
    const activeCount = activeHabits.length;

    const palKey = state.settings.palette || 'terracotta';
    const pal = PALETTES[palKey] || PALETTES['terracotta'];

    // Si c'est une habitude spécifique, utiliser sa couleur personnalisée
    let habitCustomFill = pal.l4;
    if (habitId) {
      const hObj = state.habits.find(h => h.id === habitId);
      if (hObj && HABIT_COLORS[hObj.color]) {
        habitCustomFill = HABIT_COLORS[hObj.color].fill;
      }
    }

    const cellSize = 10;
    const gap = 3;
    const step = cellSize + gap;
    const leftMargin = 28;
    const topMargin = 16;

    const svgWidth = leftMargin + NUM_WEEKS * step + 4;
    const svgHeight = topMargin + 7 * step + 2;

    let daysLabelsSvg = `
      <text text-anchor="start" class="wday-label" x="0" y="${topMargin + 1 * step + 8}">Lun</text>
      <text text-anchor="start" class="wday-label" x="0" y="${topMargin + 3 * step + 8}">Mer</text>
      <text text-anchor="start" class="wday-label" x="0" y="${topMargin + 5 * step + 8}">Ven</text>
    `;

    let weeksSvg = '';
    let monthsSvg = '';
    let lastMonthIndex = -1;
    let lastMonthX = -999;

    const monthShortNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    let curDate = new Date(startDate);

    for (let w = 0; w < NUM_WEEKS; w++) {
      const colX = leftMargin + w * step;
      let colCells = '';

      let weekFirstDay = new Date(curDate);
      let monthDetected = weekFirstDay.getMonth();

      for (let d = 0; d < 7; d++) {
        const dCheck = new Date(curDate);
        dCheck.setDate(dCheck.getDate() + d);
        if (dCheck.getDate() === 1) {
          monthDetected = dCheck.getMonth();
          break;
        }
      }

      if (monthDetected !== lastMonthIndex && (colX - lastMonthX) >= 26) {
        monthsSvg += `<text x="${colX}" y="10" class="month-label">${monthShortNames[monthDetected]}</text>`;
        lastMonthIndex = monthDetected;
        lastMonthX = colX;
      }

      for (let r = 0; r < 7; r++) {
        const dStr = getLocalDateStr(curDate);
        const cellY = topMargin + r * step;
        const isFuture = curDate > today;

        if (!isFuture) {
          let level = 0;
          let doneCount = 0;

          if (habitId) {
            const isSingleDone = !!(state.logs[habitId] && state.logs[habitId][dStr]);
            level = isSingleDone ? 4 : 0;
            doneCount = isSingleDone ? 1 : 0;
          } else {
            activeHabits.forEach(h => {
              if (state.logs[h.id] && state.logs[h.id][dStr]) doneCount++;
            });

            if (activeCount > 0 && doneCount > 0) {
              const ratio = doneCount / activeCount;
              if (ratio === 1) level = 4;
              else if (ratio >= 0.66) level = 3;
              else if (ratio >= 0.33) level = 2;
              else level = 1;
            }
          }

          let fillColor = pal.l0;
          let strokeColor = pal.l0_stroke;

          if (habitId) {
            if (level === 4) {
              fillColor = habitCustomFill;
              strokeColor = 'transparent';
            }
          } else {
            if (level === 1) { fillColor = pal.l1; strokeColor = 'transparent'; }
            else if (level === 2) { fillColor = pal.l2; strokeColor = 'transparent'; }
            else if (level === 3) { fillColor = pal.l3; strokeColor = 'transparent'; }
            else if (level === 4) { fillColor = pal.l4; strokeColor = 'transparent'; }
          }

          const isToday = dStr === todayStr;
          const todayClass = isToday ? 'today-highlight' : '';

          colCells += `
            <rect class="ContributionCalendar-day ${todayClass}"
                  width="${cellSize}"
                  height="${cellSize}"
                  x="${colX}"
                  y="${cellY}"
                  rx="2"
                  ry="2"
                  fill="${fillColor}"
                  stroke="${strokeColor}"
                  data-date="${dStr}"
                  data-level="${level}"
                  data-done="${doneCount}"
                  data-total="${habitId ? 1 : activeCount}"
                  ${habitId ? `data-habit-id="${habitId}"` : ''}>
            </rect>
          `;
        }

        curDate.setDate(curDate.getDate() + 1);
      }

      weeksSvg += `<g data-week="${w}">${colCells}</g>`;
    }

    return `
      <svg class="js-calendar-graph-svg"
           width="${svgWidth}"
           height="${svgHeight}"
           viewBox="0 0 ${svgWidth} ${svgHeight}">
        ${daysLabelsSvg}
        ${monthsSvg}
        ${weeksSvg}
      </svg>
    `;
  }

  // --- Rendu de la Matrice Globale ---
  function renderGlobalGitHubGraph() {
    const container = document.getElementById('global-github-svg-container');
    const titleEl = document.getElementById('github-contributions-count');
    if (!container) return;

    container.innerHTML = generateGitHubCalendarSVG(null);

    const stats = computeGlobalStats();
    if (titleEl) {
      const count = stats.totalPastYearCompletions;
      titleEl.textContent = `${count} ${count > 1 ? 'habitudes validées' : 'habitude validée'} sur l'année écoulée`;
    }

    updateLegendColors();
    attachSvgCellListeners(container);
  }

  function updateLegendColors() {
    const palKey = state.settings.palette || 'terracotta';
    const pal = PALETTES[palKey] || PALETTES['terracotta'];

    const sq0 = document.querySelector('.legend-sq.level-0');
    const sq1 = document.querySelector('.legend-sq.level-1');
    const sq2 = document.querySelector('.legend-sq.level-2');
    const sq3 = document.querySelector('.legend-sq.level-3');
    const sq4 = document.querySelector('.legend-sq.level-4');

    if (sq0) { sq0.style.background = pal.l0; sq0.style.border = `1px solid ${pal.l0_stroke}`; }
    if (sq1) sq1.style.background = pal.l1;
    if (sq2) sq2.style.background = pal.l2;
    if (sq3) sq3.style.background = pal.l3;
    if (sq4) sq4.style.background = pal.l4;

    const palLabel = document.getElementById('current-palette-name');
    if (palLabel) palLabel.textContent = pal.name;

    const dotPreview = document.getElementById('palette-dot-preview');
    if (dotPreview) dotPreview.style.background = pal.dot;
  }

  // --- Tooltips & Clics SVG ---
  const tooltip = document.getElementById('tooltip');

  function attachSvgCellListeners(container) {
    container.querySelectorAll('rect.ContributionCalendar-day').forEach(cell => {
      cell.addEventListener('mouseenter', (e) => {
        const dateStr = cell.getAttribute('data-date');
        const done = parseInt(cell.getAttribute('data-done'), 10) || 0;
        const total = parseInt(cell.getAttribute('data-total'), 10) || 0;
        const habitId = cell.getAttribute('data-habit-id');

        let text = '';
        if (habitId) {
          const habit = state.habits.find(h => h.id === habitId);
          const isDone = done > 0;
          text = `${habit ? habit.name : 'Habitude'} : ${isDone ? 'Validé ✨' : 'Non fait'}\nle ${formatDateFrench(dateStr)}`;
        } else {
          if (done === 0) {
            text = `Aucune habitude validée le ${formatDateFrench(dateStr)}`;
          } else {
            text = `${done} sur ${total} ${done > 1 ? 'habitudes complétées' : 'habitude complétée'} (${Math.round((done / total) * 100)}%)\nle ${formatDateFrench(dateStr)}`;
          }
        }

        tooltip.textContent = text;
        tooltip.classList.remove('hidden');

        const rect = cell.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top}px`;
      });

      cell.addEventListener('mouseleave', () => {
        tooltip.classList.add('hidden');
      });

      cell.addEventListener('click', (e) => {
        const dateStr = cell.getAttribute('data-date');
        const habitId = cell.getAttribute('data-habit-id');
        if (habitId) {
          toggleHabit(habitId, dateStr, e.clientX, e.clientY);
        } else {
          openDayModal(dateStr);
        }
      });
    });
  }

  // ==========================================================================
  // PANNEAU GAUCHE : LISTE DES HABITUDES AVEC BOUTON "+ VALIDER"
  // ==========================================================================
  function renderSidebarHabitsList() {
    const container = document.getElementById('habits-list-container');
    if (!container) return;

    const todayStr = getLocalDateStr();
    let habits = state.habits.filter(h => !h.archived);

    if (currentFilter === 'pending') {
      habits = habits.filter(h => !state.logs[h.id] || !state.logs[h.id][todayStr]);
    } else if (currentFilter === 'completed') {
      habits = habits.filter(h => state.logs[h.id] && state.logs[h.id][todayStr]);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      habits = habits.filter(h => h.name.toLowerCase().includes(q) || (h.desc && h.desc.toLowerCase().includes(q)));
    }

    if (habits.length === 0) {
      container.innerHTML = `
        <div style="padding: 24px 10px; text-align: center; color: var(--text-muted); font-size: 12px;">
          ${searchQuery ? 'Aucune habitude trouvée.' : 'Aucune habitude dans cette vue.'}
        </div>
      `;
      return;
    }

    let html = '';
    habits.forEach(habit => {
      const isDone = !!(state.logs[habit.id] && state.logs[habit.id][todayStr]);
      const isSelected = habit.id === selectedHabitId;
      const streak = computeHabitStreak(habit.id);

      html += `
        <div class="habit-list-item ${isSelected ? 'selected' : ''} ${isDone ? 'completed' : ''}" data-id="${habit.id}">
          <div class="item-left-block">
            <div class="item-artwork-box">${habit.emoji || '⚡'}</div>
            <div class="item-meta-text">
              <div class="item-title-text">${escapeHtml(habit.name)}</div>
              <div class="item-sub-text">
                <span>🔥 ${streak.currentStreak} j</span>
                <span>• ${isDone ? 'Fait aujourd’hui' : 'À faire'}</span>
              </div>
            </div>
          </div>

          <!-- Bouton explicite "+ Valider" / "✓ Fait" -->
          <button class="item-validate-pill-btn" data-id="${habit.id}">
            ${isDone ? '✓ Fait' : '+ Valider'}
          </button>
        </div>
      `;
    });

    container.innerHTML = html;

    // Listeners sur les cartes
    container.querySelectorAll('.habit-list-item').forEach(item => {
      item.addEventListener('click', (e) => {
        selectedHabitId = item.getAttribute('data-id');
        renderSidebarHabitsList();
        // Scroller doucement vers sa sous-partie si elle existe
        const subCard = document.querySelector(`.sub-habit-card[data-id="${selectedHabitId}"]`);
        if (subCard) subCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });

      // Clic droit contextuel
      item.addEventListener('contextmenu', (e) => {
        openContextMenu(e, item.getAttribute('data-id'));
      });
    });

    // Bouton Valider de la sidebar
    container.querySelectorAll('.item-validate-pill-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const rect = btn.getBoundingClientRect();
        toggleHabit(id, todayStr, rect.left + rect.width / 2, rect.top + rect.height / 2);
      });
    });
  }

  // ==========================================================================
  // SOUS-PARTIES : TABLEAUX DE SUIVI DÉDIÉS ET BOUTONS VALIDER PAR HABITUDE
  // ==========================================================================
  function renderSubHabitsSection() {
    const container = document.getElementById('sub-habits-container');
    if (!container) return;

    const todayStr = getLocalDateStr();
    let habits = state.habits.filter(h => !h.archived);

    if (currentFilter === 'pending') {
      habits = habits.filter(h => !state.logs[h.id] || !state.logs[h.id][todayStr]);
    } else if (currentFilter === 'completed') {
      habits = habits.filter(h => state.logs[h.id] && state.logs[h.id][todayStr]);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      habits = habits.filter(h => h.name.toLowerCase().includes(q) || (h.desc && h.desc.toLowerCase().includes(q)));
    }

    if (habits.length === 0) {
      container.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-muted); background: var(--glass-box-dark); border-radius: var(--radius-card); border: 1px solid var(--glass-border-subtle);">
          Aucune habitude à afficher dans cette catégorie.
        </div>
      `;
      return;
    }

    let html = '';
    habits.forEach(habit => {
      const isDone = !!(state.logs[habit.id] && state.logs[habit.id][todayStr]);
      const streak = computeHabitStreak(habit.id);

      html += `
        <div class="sub-habit-card" data-id="${habit.id}">
          <div class="sub-habit-header">
            <div class="sub-habit-identity">
              <div class="sub-habit-emoji">${habit.emoji || '⚡'}</div>
              <div>
                <div class="sub-habit-name">${escapeHtml(habit.name)}</div>
                <div style="display:flex; align-items:center; gap:6px; margin-top:2px;">
                  <span class="sub-habit-streak-pill">🔥 ${streak.currentStreak} j. d'affilée</span>
                  <span class="sub-habit-streak-pill">🏆 Record : ${streak.bestStreak} j</span>
                  <span class="sub-habit-streak-pill">🎯 ${streak.totalCompletions} actions</span>
                </div>
              </div>
            </div>

            <div class="sub-habit-actions">
              <button class="btn-sub-validate ${isDone ? 'completed' : ''}" data-id="${habit.id}">
                ${isDone ? '✓ Fait aujourd’hui' : '+ Valider aujourd’hui'}
              </button>
              <button class="btn-sub-icon edit-sub-btn" data-id="${habit.id}" title="Modifier">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button class="btn-sub-icon delete-sub-btn" data-id="${habit.id}" title="Supprimer">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>

          <!-- Tableau de suivi SVG individuel pour cette habitude -->
          <div class="sub-habit-graph-box">
            ${generateGitHubCalendarSVG(habit.id)}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    // Listeners sur les boutons de validation des sous-parties
    container.querySelectorAll('.btn-sub-validate').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        const rect = btn.getBoundingClientRect();
        toggleHabit(id, todayStr, rect.left + rect.width / 2, rect.top + rect.height / 2);
      });
    });

    container.querySelectorAll('.edit-sub-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        openEditHabitModal(btn.getAttribute('data-id'));
      });
    });

    container.querySelectorAll('.delete-sub-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        deleteHabit(btn.getAttribute('data-id'));
      });
    });

    // Clic droit contextuel sur la carte de sous-partie
    container.querySelectorAll('.sub-habit-card').forEach(card => {
      card.addEventListener('contextmenu', (e) => {
        openContextMenu(e, card.getAttribute('data-id'));
      });
    });

    attachSvgCellListeners(container);
  }

  // Action BOOM
  function toggleHabit(habitId, dateStr, clientX, clientY) {
    if (!state.logs[habitId]) state.logs[habitId] = {};

    const currentlyDone = !!state.logs[habitId][dateStr];
    const willBeDone = !currentlyDone;

    state.logs[habitId][dateStr] = willBeDone;
    saveData();

    if (willBeDone) {
      playBoomSound();
      triggerCelebration(clientX, clientY);
    } else {
      playUncheckSound();
    }

    renderAll();
  }

  function boomAllToday() {
    const todayStr = getLocalDateStr();
    const activeHabits = state.habits.filter(h => !h.archived);

    activeHabits.forEach(h => {
      if (!state.logs[h.id]) state.logs[h.id] = {};
      state.logs[h.id][todayStr] = true;
    });

    saveData();
    playBoomSound();
    triggerCelebration();
    renderAll();
  }

  // --- Rendu du Dashboard Bas ---
  function renderBottomDashboard() {
    const circle = document.getElementById('today-progress-circle');
    const percentageEl = document.getElementById('today-percentage');
    const fractionEl = document.getElementById('today-fraction');

    const todayStr = getLocalDateStr();
    const activeHabits = state.habits.filter(h => !h.archived);
    const total = activeHabits.length;

    let completedToday = 0;
    activeHabits.forEach(h => {
      if (state.logs[h.id] && state.logs[h.id][todayStr]) completedToday++;
    });

    const percent = total > 0 ? Math.round((completedToday / total) * 100) : 0;
    const circumference = 150.79;
    const offset = circumference - (percent / 100) * circumference;

    if (circle) circle.style.strokeDashoffset = offset;
    if (percentageEl) percentageEl.textContent = `${percent}%`;
    if (fractionEl) fractionEl.textContent = `${completedToday} / ${total}`;

    const stats = computeGlobalStats();
    const curEl = document.getElementById('stat-current-streak');
    const bestEl = document.getElementById('stat-best-streak');
    const totEl = document.getElementById('stat-total-completions');
    const rateEl = document.getElementById('stat-monthly-rate');

    if (curEl) curEl.textContent = `${stats.currentStreak} ${stats.currentStreak > 1 ? 'jours' : 'jour'}`;
    if (bestEl) bestEl.textContent = `${stats.bestStreak} ${stats.bestStreak > 1 ? 'jours' : 'jour'}`;
    if (totEl) totEl.textContent = stats.totalCompletions.toLocaleString();
    if (rateEl) rateEl.textContent = `${stats.monthlyRate}%`;
  }

  function renderAll() {
    renderSidebarHabitsList();
    renderGlobalGitHubGraph();
    renderBottomDashboard();
    renderSubHabitsSection();
  }

  // ==========================================================================
  // MENU CONTEXTUEL CLIC DROIT
  // ==========================================================================
  const contextMenu = document.getElementById('habit-context-menu');
  const ctxToggleBtn = document.getElementById('ctx-toggle-btn');
  const ctxToggleText = document.getElementById('ctx-toggle-text');
  const ctxEditBtn = document.getElementById('ctx-edit-btn');
  const ctxDeleteBtn = document.getElementById('ctx-delete-btn');

  function openContextMenu(e, habitId) {
    e.preventDefault(); // N'intercepte le clic droit QUE sur les cartes d'habitudes
    contextMenuHabitId = habitId;

    const todayStr = getLocalDateStr();
    const isDone = !!(state.logs[habitId] && state.logs[habitId][todayStr]);
    if (ctxToggleText) {
      ctxToggleText.textContent = isDone ? 'Annuler la validation d’aujourd’hui' : 'Valider pour aujourd’hui ✨';
    }

    contextMenu.style.left = `${Math.min(e.clientX, window.innerWidth - 200)}px`;
    contextMenu.style.top = `${Math.min(e.clientY, window.innerHeight - 150)}px`;
    contextMenu.classList.remove('hidden');
  }

  function closeContextMenu() {
    contextMenu.classList.add('hidden');
    contextMenuHabitId = null;
  }

  // ==========================================================================
  // MODALS & FORMULAIRES
  // ==========================================================================
  const habitModal = document.getElementById('habit-modal');
  const habitForm = document.getElementById('habit-form');
  const addHabitBtn = document.getElementById('add-habit-btn');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');

  function openAddHabitModal() {
    document.getElementById('modal-title').textContent = 'Créer une habitude';
    document.getElementById('form-habit-id').value = '';
    document.getElementById('form-habit-name').value = '';
    document.getElementById('form-habit-desc').value = '';
    document.getElementById('form-habit-emoji').value = '⚡';
    document.querySelector('input[name="habit-color"][value="terracotta"]').checked = true;

    habitModal.classList.remove('hidden');
    document.getElementById('form-habit-name').focus();
  }

  function openEditHabitModal(habitId) {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;

    document.getElementById('modal-title').textContent = 'Modifier l’habitude';
    document.getElementById('form-habit-id').value = habit.id;
    document.getElementById('form-habit-name').value = habit.name;
    document.getElementById('form-habit-desc').value = habit.desc || '';
    document.getElementById('form-habit-emoji').value = habit.emoji || '⚡';

    const colorRadio = document.querySelector(`input[name="habit-color"][value="${habit.color || 'terracotta'}"]`);
    if (colorRadio) colorRadio.checked = true;

    habitModal.classList.remove('hidden');
    document.getElementById('form-habit-name').focus();
  }

  function closeHabitModal() {
    habitModal.classList.add('hidden');
  }

  function handleHabitFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('form-habit-id').value;
    const name = document.getElementById('form-habit-name').value.trim();
    const desc = document.getElementById('form-habit-desc').value.trim();
    const emoji = document.getElementById('form-habit-emoji').value.trim() || '⚡';
    const color = document.querySelector('input[name="habit-color"]:checked')?.value || 'terracotta';

    if (!name) return;

    if (id) {
      const habit = state.habits.find(h => h.id === id);
      if (habit) {
        habit.name = name;
        habit.desc = desc;
        habit.emoji = emoji;
        habit.color = color;
      }
    } else {
      const newHabit = {
        id: 'h_' + Date.now().toString(36),
        name,
        desc,
        emoji,
        color,
        createdAt: new Date().toISOString()
      };
      state.habits.push(newHabit);
      state.logs[newHabit.id] = {};
      selectedHabitId = newHabit.id;
    }

    saveData();
    closeHabitModal();
    renderAll();
  }

  function deleteHabit(habitId) {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;
    if (confirm(`Voulez-vous supprimer définitivement "${habit.name}" et son historique ?`)) {
      state.habits = state.habits.filter(h => h.id !== habitId);
      delete state.logs[habitId];
      if (selectedHabitId === habitId) {
        selectedHabitId = state.habits.length > 0 ? state.habits[0].id : null;
      }
      saveData();
      renderAll();
    }
  }

  // Modal Jour Spécifique
  const dayModal = document.getElementById('day-modal');
  const dayModalDoneBtn = document.getElementById('day-modal-done-btn');
  const dayModalCloseBtn = document.getElementById('day-modal-close-btn');

  function openDayModal(dateStr) {
    document.getElementById('day-modal-date').textContent = formatDateFrench(dateStr);
    const listContainer = document.getElementById('day-modal-habits-list');

    let html = '';
    state.habits.forEach(habit => {
      const isDone = !!(state.logs[habit.id] && state.logs[habit.id][dateStr]);
      html += `
        <div class="day-modal-item ${isDone ? 'active' : ''}" data-id="${habit.id}">
          <div style="display:flex; align-items:center; gap:8px;">
            <span>${habit.emoji}</span>
            <span style="font-weight: 500;">${escapeHtml(habit.name)}</span>
          </div>
          <span style="font-size:11.5px; font-weight:600; color: ${isDone ? 'var(--accent-terracotta)' : 'var(--text-muted)'};">
            ${isDone ? '✓ Validé' : 'Non fait'}
          </span>
        </div>
      `;
    });

    listContainer.innerHTML = html;

    listContainer.querySelectorAll('.day-modal-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const habitId = item.getAttribute('data-id');
        toggleHabit(habitId, dateStr, e.clientX, e.clientY);
        openDayModal(dateStr);
      });
    });

    dayModal.classList.remove('hidden');
  }

  function closeDayModal() {
    dayModal.classList.add('hidden');
  }

  // Modal Aide
  const helpModal = document.getElementById('help-modal');
  const helpModalCloseBtn = document.getElementById('help-modal-close-btn');
  const helpModalOkBtn = document.getElementById('help-modal-ok-btn');
  const githubHelpBtn = document.getElementById('github-help-btn');

  function openHelpModal() { helpModal.classList.remove('hidden'); }
  function closeHelpModal() { helpModal.classList.add('hidden'); }

  // --- Gestion du Son & Palettes ---
  function updateSoundUI() {
    const soundOn = document.getElementById('sound-on-icon');
    const soundOff = document.getElementById('sound-off-icon');
    if (state.settings.sound) {
      soundOn.classList.remove('hidden');
      soundOff.classList.add('hidden');
    } else {
      soundOn.classList.add('hidden');
      soundOff.classList.remove('hidden');
    }
  }

  function toggleSound() {
    state.settings.sound = !state.settings.sound;
    saveData();
    updateSoundUI();
    if (state.settings.sound) playBoomSound();
  }

  function selectPalette(palKey) {
    if (PALETTES[palKey]) {
      state.settings.palette = palKey;
      saveData();
      renderGlobalGitHubGraph();
    }
  }

  function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `cadence_habits_${getLocalDateStr()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  function importData(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported && Array.isArray(imported.habits) && imported.logs) {
          state = imported;
          await saveData();
          renderAll();
          alert("Données importées avec succès dans data.json !");
        } else {
          alert("Format JSON invalide.");
        }
      } catch (err) {
        alert("Erreur de lecture : " + err.message);
      }
    };
    reader.readAsText(file);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==========================================================================
  // INITIALISATION
  // ==========================================================================
  async function init() {
    await loadData();
    updateSoundUI();

    const dateTextEl = document.getElementById('date-text');
    if (dateTextEl) {
      dateTextEl.textContent = formatDateFrench(getLocalDateStr(), false);
    }

    document.getElementById('sound-toggle-btn').addEventListener('click', toggleSound);

    const backupBtn = document.getElementById('backup-menu-btn');
    const backupDropdown = document.getElementById('backup-dropdown');
    backupBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      backupDropdown.classList.toggle('hidden');
    });

    document.getElementById('save-server-btn').addEventListener('click', async () => {
      await saveData();
      alert("Données réécrites avec succès dans d:\\App\\data.json !");
    });
    document.getElementById('export-btn').addEventListener('click', exportData);
    document.getElementById('import-file-input').addEventListener('change', (e) => {
      if (e.target.files.length > 0) importData(e.target.files[0]);
    });
    document.getElementById('reset-sample-btn').addEventListener('click', async () => {
      if (confirm("Réinitialiser les données ?")) {
        localStorage.removeItem(STORAGE_KEY);
        await loadData();
        renderAll();
      }
    });

    // Menu Palettes
    const palBtn = document.getElementById('palette-menu-btn');
    const palDropdown = document.getElementById('palette-dropdown');
    palBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      palDropdown.classList.toggle('hidden');
    });

    document.querySelectorAll('.palette-select-item').forEach(btn => {
      btn.addEventListener('click', () => {
        selectPalette(btn.getAttribute('data-palette'));
        palDropdown.classList.add('hidden');
      });
    });

    // Clics globaux pour fermer les menus et contextmenu
    document.addEventListener('click', () => {
      backupDropdown.classList.add('hidden');
      palDropdown.classList.add('hidden');
      closeContextMenu();
    });

    // Événements du menu contextuel
    ctxToggleBtn.addEventListener('click', () => {
      if (contextMenuHabitId) {
        const todayStr = getLocalDateStr();
        toggleHabit(contextMenuHabitId, todayStr);
      }
      closeContextMenu();
    });

    ctxEditBtn.addEventListener('click', () => {
      if (contextMenuHabitId) {
        openEditHabitModal(contextMenuHabitId);
      }
      closeContextMenu();
    });

    ctxDeleteBtn.addEventListener('click', () => {
      if (contextMenuHabitId) {
        deleteHabit(contextMenuHabitId);
      }
      closeContextMenu();
    });

    // Onglets de filtre
    document.querySelectorAll('#habits-filter .seg-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#habits-filter .seg-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        renderSidebarHabitsList();
        renderSubHabitsSection();
      });
    });

    // Recherche
    const searchInput = document.getElementById('habit-search-input');
    const searchClear = document.getElementById('search-clear-btn');
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value;
      if (searchQuery) {
        searchClear.classList.remove('hidden');
      } else {
        searchClear.classList.add('hidden');
      }
      renderSidebarHabitsList();
      renderSubHabitsSection();
    });

    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      searchClear.classList.add('hidden');
      renderSidebarHabitsList();
      renderSubHabitsSection();
    });

    // Bouton Tout valider
    document.getElementById('quick-boom-all-btn').addEventListener('click', boomAllToday);

    // Modal Habitude
    addHabitBtn.addEventListener('click', openAddHabitModal);
    modalCloseBtn.addEventListener('click', closeHabitModal);
    modalCancelBtn.addEventListener('click', closeHabitModal);
    habitForm.addEventListener('submit', handleHabitFormSubmit);

    document.querySelectorAll('.emoji-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.getElementById('form-habit-emoji').value = chip.getAttribute('data-emoji');
      });
    });

    // Modal Jour
    dayModalDoneBtn.addEventListener('click', closeDayModal);
    dayModalCloseBtn.addEventListener('click', closeDayModal);

    // Modal Aide
    if (githubHelpBtn) githubHelpBtn.addEventListener('click', openHelpModal);
    if (helpModalCloseBtn) helpModalCloseBtn.addEventListener('click', closeHelpModal);
    if (helpModalOkBtn) helpModalOkBtn.addEventListener('click', closeHelpModal);

    // Raccourcis clavier
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeHabitModal();
        closeDayModal();
        closeHelpModal();
        closeContextMenu();
        backupDropdown.classList.add('hidden');
        palDropdown.classList.add('hidden');
      }
    });

    renderAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
