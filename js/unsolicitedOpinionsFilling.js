// unsolicitedOpinionsFilling.js
//
// Fetches unsolicitedOpinions.json and renders a single-column list of
// expandable cards. Each card has two vote buttons (approve / disapprove)
// whose counts are stored on the Abacus counting API
// (https://abacus.jasoncameron.dev/).
//
// Architecture:
//   - Live counts live on Abacus. Namespace + keys are read from
//     jsons/unsolicitedOpinionsCounts.json (namespace field).
//   - On load we call `/get` for each (opinionId, direction) pair. On
//     failure (network, 404, CORS, etc.) we fall back to the counts in
//     the baseline JSON file — which is a manually-maintained snapshot.
//   - On click we call `/hit` to increment, update the UI optimistically,
//     and remember the user's current choice in localStorage.
//   - The user can change their mind: clicking the OTHER direction fires
//     /hit on the new direction and re-paints the UI. Because Abacus
//     doesn't allow public decrement, the old direction's count is NOT
//     rolled back — counts are cumulative clicks, not net votes. We own
//     that in the UI copy below the buttons. Clicking the SAME direction
//     you've already picked is a no-op (no double-count).
//
// The section is also hidden entirely in formal mode — see switchBio.js.

const ABACUS_BASE = 'https://abacus.jasoncameron.dev';
// Prefixes are suffixed with '-v2-' (and future bumps) to reset all users'
// localStorage state in sync with a namespace bump on Abacus. Keep these in
// lockstep with the `namespace` field in jsons/unsolicitedOpinionsCounts.json.
const LOCAL_STORAGE_PREFIX = 'unsolicited-voted-v2-';
const LOCAL_STORAGE_LOVE_PREFIX = 'unsolicited-postscript-loved-v2-';

// Kick off the two fetches in parallel.
Promise.all([
  fetch('jsons/unsolicitedOpinions.json').then(r => {
    if (!r.ok) throw new Error('opinions fetch failed');
    return r.json();
  }),
  fetch('jsons/unsolicitedOpinionsCounts.json').then(r => {
    if (!r.ok) throw new Error('counts fetch failed');
    return r.json();
  }).catch(err => {
    console.warn('Could not load counts baseline, defaulting to zeroes:', err);
    return { namespace: 'stefanolambiase-unsolicited-opinions-v2', counts: {} };
  })
])
  .then(([opinionsData, countsData]) => {
    const container = document.getElementById('unsolicited-opinions-container');
    if (!container) return;

    const opinions = opinionsData.unsolicitedOpinions || [];
    const namespace = countsData.namespace || 'stefanolambiase-unsolicited-opinions';
    const baseline = countsData.counts || {};

    if (opinions.length === 0) {
      container.innerHTML = '<div class="col text-center text-muted py-4">No opinions here yet&mdash;somehow.</div>';
      return;
    }

    opinions.forEach((opinion, index) => {
      renderCard(container, opinion, index, namespace, baseline[opinion.id] || { approve: 0, disapprove: 0 });
    });

    wireSearchFilter(container);
  })
  .catch(error => console.error('Error loading unsolicited opinions:', error));

// Hook the search input up to a simple textContent-based filter. Runs on
// every keystroke; case-insensitive substring match across the card's full
// rendered text, which includes the tag, title, hot take, body, and the
// (hidden) expanded content. That means a user can find "latex" or "boxes"
// without expanding anything.
function wireSearchFilter(container) {
  const input = document.getElementById('unsolicited-opinions-search');
  const noResults = document.getElementById('unsolicited-opinions-no-results');
  if (!input || !container) return;

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    const cards = container.querySelectorAll(':scope > div');
    let anyVisible = false;

    cards.forEach(card => {
      const match = q === '' || card.textContent.toLowerCase().includes(q);
      card.style.display = match ? '' : 'none';
      if (match) anyVisible = true;
    });

    if (noResults) {
      noResults.style.display = (q === '' || anyVisible) ? 'none' : '';
    }
  });
}

function renderCard(container, opinion, index, namespace, baselineCounts) {
  const bodyId = `unsolicited-body-${opinion.id || index}`;
  const approveKey = `${opinion.id}-approve`;
  const disapproveKey = `${opinion.id}-disapprove`;

  const tagBadge = opinion.tag
    ? `<span class="badge bg-secondary me-1 mb-2">${opinion.tag}</span>`
    : '';

  // Optional postscript / linked comment styled as a small callout.
  // If present it also gets its own "love" counter (positive-only heart).
  const postscriptLoveBaseline = (baselineCounts && baselineCounts.postscriptLove) || 0;
  const postscriptHtml = opinion.postscript
    ? `
      <aside class="unsolicited-postscript mt-3">
        <div class="unsolicited-postscript-title"><strong>${opinion.postscript.title}</strong></div>
        <div class="unsolicited-postscript-body">${opinion.postscript.body}</div>
        <div class="unsolicited-postscript-love d-flex justify-content-end align-items-center mt-2">
          <button type="button" class="btn btn-sm btn-outline-danger unsolicited-love-btn" data-love-suffix="postscript-love" aria-pressed="false" aria-label="Love this postscript">
            <em class="fa-regular fa-heart me-1 unsolicited-love-icon"></em>
            <span class="unsolicited-love-count">${postscriptLoveBaseline}</span>
          </button>
        </div>
      </aside>
    `
    : '';

  // If the site is already in dark mode when this card is created, apply
  // the same Bootstrap classes that switchMode.js would add. Otherwise
  // the <li>, <strong>, <code>, <em> elements inside the body — which
  // aren't styled explicitly by the dark theme CSS — inherit the default
  // browser text color (black) and become unreadable on the dark card
  // background.
  const themeLink = document.querySelector('#theme-link');
  const isDark = themeLink && /dark/.test(themeLink.getAttribute('href') || '');
  const darkClasses = isDark ? ' text-white bg-dark' : '';

  const col = document.createElement('div');
  col.classList.add('col-12', 'pb-3');

  col.innerHTML = `
    <div class="card unsolicited-card${darkClasses}">
      <div class="card-body unsolicited-header" role="button" tabindex="0" aria-expanded="false" aria-controls="${bodyId}">
        <div>
          ${tagBadge}
        </div>
        <h6 class="card-title"><strong>${opinion.shortTitle}</strong></h6>
        <p class="card-text text-muted small mb-2">${opinion.hotTake}</p>
        <div class="text-muted small unsolicited-hint">
          <em class="fa-solid fa-chevron-down me-1"></em>
          <span class="unsolicited-hint-text">Click for the full rant</span>
        </div>
      </div>
      <div class="unsolicited-body" id="${bodyId}" style="display: none;">
        <div class="card-body pt-0">
          <hr class="mt-0">
          ${opinion.body}
          ${postscriptHtml}
          <div class="unsolicited-votes mt-3 d-flex align-items-center flex-wrap gap-2">
            <span class="text-muted small me-1">Agree?</span>
            <button type="button" class="btn btn-sm btn-outline-success unsolicited-vote-btn" data-direction="approve" aria-pressed="false">
              <em class="fa-solid fa-thumbs-up me-1"></em>
              <span class="unsolicited-vote-count">${baselineCounts.approve || 0}</span>
            </button>
            <button type="button" class="btn btn-sm btn-outline-danger unsolicited-vote-btn" data-direction="disapprove" aria-pressed="false">
              <em class="fa-solid fa-thumbs-down me-1"></em>
              <span class="unsolicited-vote-count">${baselineCounts.disapprove || 0}</span>
            </button>
            <span class="text-muted small ms-auto unsolicited-vote-status"></span>
          </div>
          <p class="text-muted small fst-italic mt-2 mb-0 unsolicited-change-note" style="display: none;">
            Only fools never change their mind&mdash;but I was too lazy to wire up a proper vote-update mechanism, so we'll keep both clicks on the board for now. Work in progress.
          </p>
        </div>
      </div>
    </div>
  `;

  container.appendChild(col);

  // Expand/collapse wiring.
  const header = col.querySelector('.unsolicited-header');
  const body = col.querySelector('.unsolicited-body');
  const chevron = col.querySelector('.unsolicited-hint em');
  const hintText = col.querySelector('.unsolicited-hint-text');

  const setOpen = (open) => {
    if (open) {
      body.style.display = '';
      if (chevron) {
        chevron.classList.remove('fa-chevron-down');
        chevron.classList.add('fa-chevron-up');
      }
      if (hintText) hintText.textContent = 'Click to collapse';
      header.setAttribute('aria-expanded', 'true');
    } else {
      body.style.display = 'none';
      if (chevron) {
        chevron.classList.remove('fa-chevron-up');
        chevron.classList.add('fa-chevron-down');
      }
      if (hintText) hintText.textContent = 'Click for the full rant';
      header.setAttribute('aria-expanded', 'false');
    }
  };

  const toggle = () => {
    const isOpen = header.getAttribute('aria-expanded') === 'true';
    setOpen(!isOpen);
  };

  header.addEventListener('click', toggle);
  header.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  });

  // Vote buttons wiring.
  const voteButtons = col.querySelectorAll('.unsolicited-vote-btn');
  const statusEl = col.querySelector('.unsolicited-vote-status');
  const approveBtn = col.querySelector('.unsolicited-vote-btn[data-direction="approve"]');
  const disapproveBtn = col.querySelector('.unsolicited-vote-btn[data-direction="disapprove"]');
  const approveCountEl = approveBtn.querySelector('.unsolicited-vote-count');
  const disapproveCountEl = disapproveBtn.querySelector('.unsolicited-vote-count');

  // Fetch live counts from Abacus (read-only /get; doesn't increment).
  fetchCount(namespace, approveKey).then(n => {
    if (typeof n === 'number') approveCountEl.textContent = n;
  });
  fetchCount(namespace, disapproveKey).then(n => {
    if (typeof n === 'number') disapproveCountEl.textContent = n;
  });

  // Restore "already voted" state from localStorage.
  const storedVote = localStorage.getItem(LOCAL_STORAGE_PREFIX + opinion.id);
  if (storedVote === 'approve' || storedVote === 'disapprove') {
    paintVoteState(voteButtons, storedVote, statusEl, /*isChange=*/false);
  }

  voteButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // don't toggle the card collapse.
      const direction = btn.getAttribute('data-direction');
      const previousVote = localStorage.getItem(LOCAL_STORAGE_PREFIX + opinion.id);

      // No-op: clicking the direction you already picked doesn't do anything.
      // (Abacus doesn't let us decrement publicly, and we don't want to
      // double-count the same user's stance.)
      if (previousVote === direction) return;

      const isChange = !!previousVote;

      // Optimistic UI update: increment the clicked direction locally.
      const countEl = btn.querySelector('.unsolicited-vote-count');
      const current = parseInt(countEl.textContent, 10) || 0;
      countEl.textContent = current + 1;
      localStorage.setItem(LOCAL_STORAGE_PREFIX + opinion.id, direction);
      paintVoteState(voteButtons, direction, statusEl, isChange);

      // Fire the /hit for the new direction. The old direction's count
      // stays put — counts are cumulative clicks, and the caveat under
      // the buttons makes that explicit.
      const key = direction === 'approve' ? approveKey : disapproveKey;
      hitCount(namespace, key).then(n => {
        if (typeof n === 'number') countEl.textContent = n;
      }).catch(err => {
        console.warn('Abacus /hit failed for', key, err);
      });
    });
  });

  // "Love" heart buttons (positive-only counters). There can be more than
  // one per card — e.g. the em-dash card has a postscript love button, the
  // tables-and-boxes card has a "small ask" love button inside its intro
  // aside. Each button identifies itself via data-love-suffix, which is
  // appended to the opinion id to form the Abacus key and the localStorage
  // key. The baseline count (if any) is read from
  // baselineCounts[camelCase(suffix)].
  const loveBtns = col.querySelectorAll('.unsolicited-love-btn');
  loveBtns.forEach(loveBtn => {
    const suffix = loveBtn.getAttribute('data-love-suffix') || 'postscript-love';
    const loveKey = `${opinion.id}-${suffix}`;
    const storageKey = `${LOCAL_STORAGE_LOVE_PREFIX}${opinion.id}-${suffix}`;
    const loveCountEl = loveBtn.querySelector('.unsolicited-love-count');
    const loveIcon = loveBtn.querySelector('.unsolicited-love-icon');

    // Prime from baseline (camelCase-ified suffix field) before network hit.
    const baselineField = suffix.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    if (baselineCounts && typeof baselineCounts[baselineField] === 'number') {
      loveCountEl.textContent = baselineCounts[baselineField];
    }

    // Fetch the live count.
    fetchCount(namespace, loveKey).then(n => {
      if (typeof n === 'number') loveCountEl.textContent = n;
    });

    // Restore "already loved" state from localStorage.
    if (localStorage.getItem(storageKey)) {
      paintLoveState(loveBtn, loveIcon, true);
    }

    loveBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // don't toggle the card collapse.
      if (localStorage.getItem(storageKey)) return;

      // Optimistic UI update.
      const current = parseInt(loveCountEl.textContent, 10) || 0;
      loveCountEl.textContent = current + 1;
      localStorage.setItem(storageKey, '1');
      paintLoveState(loveBtn, loveIcon, true);

      hitCount(namespace, loveKey).then(n => {
        if (typeof n === 'number') loveCountEl.textContent = n;
      }).catch(err => {
        console.warn('Abacus /hit failed for', loveKey, err);
      });
    });
  });
}

// Paint the love button's active/inactive state. Positive-only, so once
// active it stays active for the rest of the session.
function paintLoveState(btn, icon, active) {
  btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  btn.classList.toggle('btn-danger', active);
  btn.classList.toggle('btn-outline-danger', !active);
  if (icon) {
    icon.classList.toggle('fa-solid', active);
    icon.classList.toggle('fa-regular', !active);
  }
}

// Paint the vote buttons to reflect the user's current choice. Both
// buttons stay enabled so the user can change their mind. The chosen
// direction is rendered with the solid variant; the other one stays
// outlined.
function paintVoteState(buttons, direction, statusEl, isChange) {
  buttons.forEach(btn => {
    const btnDirection = btn.getAttribute('data-direction');
    const isActive = btnDirection === direction;
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');

    if (btnDirection === 'approve') {
      btn.classList.toggle('btn-success', isActive);
      btn.classList.toggle('btn-outline-success', !isActive);
    } else {
      btn.classList.toggle('btn-danger', isActive);
      btn.classList.toggle('btn-outline-danger', !isActive);
    }
  });

  if (statusEl) {
    if (isChange) {
      statusEl.textContent = direction === 'approve'
        ? 'Glad you came around.'
        : 'Bold pivot.';
    } else {
      statusEl.textContent = direction === 'approve'
        ? 'Thanks, noted.'
        : 'Duly noted.';
    }
  }

  // Reveal the self-deprecating change-note only when the user has
  // actually switched sides. Scoped to the card that owns these buttons.
  if (isChange && buttons.length > 0) {
    const card = buttons[0].closest('.unsolicited-card');
    if (card) {
      const note = card.querySelector('.unsolicited-change-note');
      if (note) note.style.display = '';
    }
  }
}

function fetchCount(namespace, key) {
  return fetch(`${ABACUS_BASE}/get/${encodeURIComponent(namespace)}/${encodeURIComponent(key)}`)
    .then(r => {
      if (!r.ok) throw new Error('abacus /get not ok');
      return r.json();
    })
    .then(data => (data && typeof data.value === 'number') ? data.value : null)
    .catch(err => {
      console.warn('Abacus /get failed for', key, err);
      return null;
    });
}

function hitCount(namespace, key) {
  return fetch(`${ABACUS_BASE}/hit/${encodeURIComponent(namespace)}/${encodeURIComponent(key)}`)
    .then(r => {
      if (!r.ok) throw new Error('abacus /hit not ok');
      return r.json();
    })
    .then(data => (data && typeof data.value === 'number') ? data.value : null);
}
