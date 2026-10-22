// newsOverlayFilling.js

// "Latest news" panel that floats in the bottom-right corner of the page.
// Content lives in jsons/news.json and is hand-edited, like tempNews.json.
// Visitors close the panel with the X button (or Escape) and reopen it with
// the small round button that stays in the corner. The closed state is saved
// in this browser only, together with the id of the newest item: when a new
// item is added at the top of the JSON, the panel opens again by itself.
// The optional "nowPlaying" block (the games I am playing) is shown at the
// bottom of the panel and is not part of the news list, so changing it does
// not open the panel again.
(function () {
  const STORAGE_KEY = 'newsOverlayClosedFor';

  // localStorage can throw (private windows, blocked site data). The panel
  // must work without it, so every access is wrapped.
  function readClosedId() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function saveClosedId(id) {
    try {
      if (id === null) {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        window.localStorage.setItem(STORAGE_KEY, id);
      }
    } catch (e) {
      // Nothing to do: the panel simply opens again on the next visit.
    }
  }

  const reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  fetch('jsons/news.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (!data.show || !Array.isArray(data.items)) return;
      const items = data.items.filter(item => item && item.text);
      if (items.length === 0) return;

      const title = data.title || 'Latest news';
      const latestId = String(items[0].id || items[0].text);

      // The panel.
      const panel = document.createElement('aside');
      panel.id = 'news-overlay';
      panel.className = 'news-overlay';
      panel.setAttribute('aria-labelledby', 'news-overlay-title');
      panel.hidden = true;

      const listHtml = items.map(item => {
        const dateHtml = item.date
          ? `<div class="news-overlay-date">${item.date}</div>`
          : '';
        const iconHtml = item.icon
          ? `<em class="${item.icon} news-overlay-icon" aria-hidden="true"></em>`
          : '';
        const linkHtml = item.link
          ? `<a class="news-overlay-link" href="${item.link}" target="_blank" rel="noopener noreferrer">${item.linkText || 'Read more'} <em class="fa-solid fa-arrow-right" aria-hidden="true"></em></a>`
          : '';
        return `<li class="news-overlay-item">${dateHtml}<div class="news-overlay-text">${iconHtml}<span>${item.text}</span></div>${linkHtml}</li>`;
      }).join('');

      const np = data.nowPlaying;
      let nowPlayingHtml = '';
      if (np && np.text) {
        const npIcon = np.icon
          ? `<em class="${np.icon} news-overlay-icon" aria-hidden="true"></em>`
          : '';
        const npLink = np.link
          ? `<a class="news-overlay-link" href="${np.link}" target="_blank" rel="noopener noreferrer">${np.linkText || 'Read more'} <em class="fa-solid fa-arrow-right" aria-hidden="true"></em></a>`
          : '';
        const npClass = np.informalOnly ? ' informal-only' : '';
        nowPlayingHtml = `<div class="news-overlay-now-playing${npClass}"><div class="news-overlay-now-playing-label">${np.label || 'Now playing'}</div><div class="news-overlay-text">${npIcon}<span>${np.text}</span></div>${npLink}</div>`;
      }

      panel.innerHTML = `
        <div class="news-overlay-header">
          <span class="temp-news-dot" aria-hidden="true"></span>
          <h2 class="news-overlay-title" id="news-overlay-title">${title}</h2>
          <button type="button" class="news-overlay-close" aria-label="Close the news">
            <em class="fa-solid fa-xmark" aria-hidden="true"></em>
          </button>
        </div>
        <ul class="news-overlay-list">${listHtml}</ul>${nowPlayingHtml}`;

      // The round button that reopens the panel.
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'news-overlay-toggle';
      toggle.setAttribute('aria-controls', 'news-overlay');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Show the latest news');
      toggle.title = title;
      toggle.hidden = true;
      toggle.innerHTML = '<em class="fa-solid fa-bullhorn" aria-hidden="true"></em><span class="news-overlay-toggle-dot" aria-hidden="true"></span>';

      document.body.appendChild(panel);
      document.body.appendChild(toggle);

      // Respect the Formal Bio switch if it is already on: switchBio.js
      // applies the mode to .informal-only elements only on load and on
      // toggle, and this fetch resolves after load.
      const bioSwitch = document.querySelector('.switch-bio');
      if (bioSwitch && bioSwitch.checked) {
        panel.querySelectorAll('.informal-only').forEach(el => {
          el.style.display = 'none';
        });
      }

      const closeBtn = panel.querySelector('.news-overlay-close');
      let hideTimer = null;

      function openPanel(moveFocus) {
        clearTimeout(hideTimer);
        panel.hidden = false;
        toggle.hidden = true;
        toggle.setAttribute('aria-expanded', 'true');
        // Two frames: the browser paints the closed state first, so the
        // fade-in transition actually runs.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => panel.classList.add('is-open'));
        });
        saveClosedId(null);
        if (moveFocus) closeBtn.focus();
      }

      function closePanel(moveFocus) {
        panel.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        saveClosedId(latestId);
        hideTimer = setTimeout(() => {
          panel.hidden = true;
          toggle.hidden = false;
          if (moveFocus) toggle.focus();
        }, reduceMotion ? 0 : 200);
      }

      closeBtn.addEventListener('click', () => closePanel(true));
      toggle.addEventListener('click', () => openPanel(true));
      panel.addEventListener('keydown', event => {
        if (event.key === 'Escape') closePanel(true);
      });

      if (readClosedId() === latestId) {
        // Closed before, and nothing new since: only the button.
        toggle.hidden = false;
      } else {
        // Short delay, so the panel appears once the page has settled.
        setTimeout(() => openPanel(false), reduceMotion ? 0 : 600);
      }
    })
    .catch(error => console.error(error));
})();
