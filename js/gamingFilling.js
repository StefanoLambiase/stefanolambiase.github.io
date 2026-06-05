// gamingFilling.js
//
// Fetches jsons/gaming.json and renders a "Gaming CV": games grouped by year
// (most recent first), each year shown as a small table. Columns adapt to the
// data: Completion shows only once at least one game has a completion value;
// Score is paused via SHOW_SCORE below. Styled to follow the active light/dark
// theme (transparent backgrounds, inherited text color).
//
// A search box filters the list live by title, year, completion AND genre.
// Genre is intentionally NOT shown in the table — it only powers the filter.
//
// The section is informal-only and is hidden in formal mode (see switchBio.js).

(function () {
  // Score column is paused for now. Flip to true to bring it back.
  const SHOW_SCORE = false;

  // Inject self-contained styles once so the script stays portable.
  if (!document.getElementById('gaming-cv-styles')) {
    const style = document.createElement('style');
    style.id = 'gaming-cv-styles';
    style.textContent = `
      .gaming-year-block { margin-top: 40px; }
      .gaming-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
      .gaming-table th, .gaming-table td {
        padding: 0.45rem 0.6rem;
        border-bottom: 1px solid rgba(128,128,128,0.25);
        vertical-align: middle;
      }
      .gaming-table thead th {
        text-transform: uppercase;
        font-size: 0.72rem;
        letter-spacing: 0.06em;
        opacity: 0.6;
        font-weight: 600;
        border-bottom-width: 2px;
      }
      .gaming-table td.gaming-game { font-weight: 600; }
      .gaming-table .gaming-num { text-align: right; white-space: nowrap; }
      .gaming-table .gaming-center { text-align: center; white-space: nowrap; }
      .gaming-note { display: block; font-size: 0.78rem; opacity: 0.55; font-weight: 400; }
      .gaming-score { font-variant-numeric: tabular-nums; }
      @media (max-width: 575px) {
        .gaming-table th.gaming-hide-sm, .gaming-table td.gaming-hide-sm,
        .gaming-table col.gaming-hide-sm { display: none; }
      }
    `;
    document.head.appendChild(style);
  }

  const esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  // Build the searchable haystack for one game (includes hidden genres + platform).
  const haystack = function (g) {
    const genres = Array.isArray(g.genres) ? g.genres.join(' ') : g.genres || '';
    return [g.title, g.completion, g.year, g.platform, genres]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
  };

  // Render a list of games (already filtered) into the container, grouped by year.
  const render = function (container, games, showCompletion, showPlatform) {
    if (!games.length) {
      container.innerHTML = '';
      return;
    }

    // Column definitions; `when` toggles a column on/off.
    const columns = [
      {
        headerCls: '',
        cellCls: 'gaming-game',
        weight: 5,
        cell: function (g) {
          const note = g.note || g.challenge;
          return (
            esc(g.title) +
            (note ? '<span class="gaming-note">' + esc(note) + '</span>' : '')
          );
        }
      },
      {
        header: 'Hours',
        headerCls: 'gaming-num',
        cellCls: 'gaming-num',
        weight: 1.6,
        cell: function (g) {
          return g.hours != null ? esc(g.hours) + 'h' : '&mdash;';
        }
      },
      {
        header: 'Platform',
        headerCls: 'gaming-center gaming-hide-sm',
        cellCls: 'gaming-center gaming-hide-sm text-muted',
        weight: 1.8,
        when: showPlatform,
        cell: function (g) {
          return esc(g.platform || '');
        }
      },
      {
        header: 'Completion',
        headerCls: 'gaming-center gaming-hide-sm',
        cellCls: 'gaming-center gaming-hide-sm text-muted',
        weight: 2.4,
        when: showCompletion,
        cell: function (g) {
          return esc(g.completion || '');
        }
      },
      {
        header: 'Score',
        headerCls: 'gaming-center',
        cellCls: 'gaming-center gaming-score',
        weight: 1.3,
        when: SHOW_SCORE,
        cell: function (g) {
          return g.score != null ? esc(g.score) + '/7' : '&mdash;';
        }
      }
    ].filter(function (c) {
      return c.when === undefined || c.when;
    });

    const totalWeight = columns.reduce(function (s, c) {
      return s + c.weight;
    }, 0);

    const byYear = {};
    games.forEach(function (g) {
      const y = g.year != null ? g.year : 'Unknown';
      (byYear[y] = byYear[y] || []).push(g);
    });

    const years = Object.keys(byYear).sort(function (a, b) {
      if (a === 'Unknown') return 1;
      if (b === 'Unknown') return -1;
      return Number(b) - Number(a);
    });

    let html = '';
    years.forEach(function (year) {
      const list = byYear[year].sort(function (a, b) {
        return (b.hours || 0) - (a.hours || 0);
      });

      html += '<div class="gaming-year-block">';
      html +=
        '<h3 class="text-inside-line text-center"><span>' +
        esc(year) +
        '</span></h3>';

      html += '<table class="gaming-table"><colgroup>';
      columns.forEach(function (c) {
        const w = ((c.weight / totalWeight) * 100).toFixed(2);
        const hide = c.headerCls.indexOf('gaming-hide-sm') !== -1 ? ' class="gaming-hide-sm"' : '';
        html += '<col' + hide + ' style="width:' + w + '%">';
      });
      html += '</colgroup><thead><tr>';
      columns.forEach(function (c) {
        html +=
          '<th' + (c.headerCls ? ' class="' + c.headerCls + '"' : '') + '>' +
          (c.header || 'Game') +
          '</th>';
      });
      html += '</tr></thead><tbody>';

      list.forEach(function (g) {
        html += '<tr>';
        columns.forEach(function (c) {
          html += '<td class="' + c.cellCls + '">' + c.cell(g) + '</td>';
        });
        html += '</tr>';
      });

      html += '</tbody></table></div>';
    });

    container.innerHTML = html;
  };

  fetch('jsons/gaming.json')
    .then(function (r) {
      if (!r.ok) throw new Error('gaming.json fetch failed');
      return r.json();
    })
    .then(function (data) {
      const container = document.getElementById('gaming-container');
      if (!container) return;

      const allGames = data.games || [];
      const search = document.getElementById('gaming-search');
      const noResults = document.getElementById('gaming-no-results');

      if (allGames.length === 0) {
        container.innerHTML =
          '<div class="text-center text-muted py-4">No games here yet.</div>';
        return;
      }

      // Show the Completion column only once there is at least one value.
      const showCompletion = allGames.some(function (g) {
        return g.completion;
      });

      // Show the Platform column only once more than one platform is present.
      const platforms = {};
      allGames.forEach(function (g) {
        if (g.platform) platforms[g.platform] = true;
      });
      const showPlatform = Object.keys(platforms).length > 1;

      const apply = function () {
        const q = (search ? search.value : '').trim().toLowerCase();
        const filtered = q
          ? allGames.filter(function (g) {
              return haystack(g).indexOf(q) !== -1;
            })
          : allGames;
        render(container, filtered, showCompletion, showPlatform);
        if (noResults) {
          noResults.style.display = filtered.length ? 'none' : '';
        }
      };

      apply();
      if (search) search.addEventListener('input', apply);
    })
    .catch(function (err) {
      console.error(err);
      const container = document.getElementById('gaming-container');
      if (container) {
        container.innerHTML =
          '<div class="text-center text-muted py-4">Could not load the gaming list.</div>';
      }
    });
})();
