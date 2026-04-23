// paperNewFilling.js

// Fetch papersNEW.json and generate the two-column paper cards with filtering
fetch('jsons/papersNEW.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    const container = document.getElementById('publications_wip_inner');
    const papers = data.publications;

    // Assign publication numbers (J1, J2... C1, C2...) sorted by year ascending
    const paperLabels = new Map();
    const journalsByYear = papers.filter(p => p.type === 'journal').sort((a, b) => a.year - b.year);
    const conferencesByYear = papers.filter(p => p.type === 'conference').sort((a, b) => a.year - b.year);
    journalsByYear.forEach((p, i) => paperLabels.set(p, `J${i + 1}`));
    conferencesByYear.forEach((p, i) => paperLabels.set(p, `C${i + 1}`));

    // Sort papers for display: by year descending, mixing journals and conferences
    // Within the same year, sort by label number descending (highest first)
    const allPapers = [...papers];
    allPapers.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      // Within same year, sort by label number descending
      const numA = parseInt(paperLabels.get(a).slice(1));
      const numB = parseInt(paperLabels.get(b).slice(1));
      return numB - numA;
    });
    const sortedPapers = allPapers;

    // Track selected years (empty set = all years shown)
    const selectedYears = new Set();

    // Populate year badges
    const yearsContainer = document.getElementById('filter-years-container');
    const years = [...new Set(sortedPapers.map(p => p.year))].sort((a, b) => b - a);
    years.forEach(year => {
      const badge = document.createElement('span');
      badge.classList.add('badge', 'bg-secondary', 'me-2', 'mb-1');
      badge.style.cursor = 'pointer';
      badge.style.fontSize = '0.9em';
      badge.style.padding = '6px 12px';
      badge.textContent = year;
      badge.dataset.year = year;

      badge.addEventListener('click', () => {
        if (selectedYears.has(year)) {
          selectedYears.delete(year);
          badge.classList.remove('bg-dark');
          badge.classList.add('bg-secondary');
        } else {
          selectedYears.add(year);
          badge.classList.remove('bg-secondary');
          badge.classList.add('bg-dark');
        }
        applyFilters();
      });

      yearsContainer.appendChild(badge);
    });

    // Render papers into the container
    function renderPapers(filteredPapers) {
      container.innerHTML = '';

      if (filteredPapers.length === 0) {
        container.innerHTML = '<div class="col-lg-8 text-center text-muted py-4">No papers match the current filters.</div>';
        return;
      }

      filteredPapers.forEach((paper, index) => {
        // Format authors: bold "Stefano Lambiase" in the list
        const authorsFormatted = paper.authors
          .map(a => a === 'Stefano Lambiase' ? '<strong>S. Lambiase</strong>' : a)
          .join(', ');

        // Build the download button only if a link is available
        const downloadBtn = paper.downloadLink
          ? `<a class="btn btn-success btn-sm" href="${paper.downloadLink}" download>Download</a>`
          : `<button class="btn btn-success btn-sm disabled" type="button" disabled>Not available</button>`;

        // Build the DOI button if available
        const doiBtn = paper.doi
          ? `<a class="btn btn-primary btn-sm" href="https://doi.org/${paper.doi}" target="_blank" rel="noopener noreferrer">DOI</a>`
          : '';

        // Build the Google Scholar search button
        const scholarQuery = encodeURIComponent(paper.title);
        const scholarBtn = `<a class="btn btn-warning btn-sm" href="https://scholar.google.com/scholar?q=${scholarQuery}" target="_blank" rel="noopener noreferrer">Scholar</a>`;

        const col = document.createElement('div');
        col.classList.add('col-lg-6', 'pb-3');

        col.innerHTML = `
          <div class="card h-100">
            <div class="card-body d-flex flex-column">
              <div class="mb-2">
                <span class="badge ${paper.type === 'journal' ? 'bg-success' : 'bg-info'}">${paper.type}</span>
                <span class="badge ${paper.type === 'journal' ? 'bg-success' : 'bg-info'}">${paperLabels.get(paper)}</span>
                <span class="badge bg-secondary">${paper.year}</span>
              </div>
              <h6 class="card-title"><strong>${paper.title}</strong></h6>
              <p class="card-text text-muted small mb-1">${paper.venue}</p>
              <p class="card-text small mt-auto pt-2">${authorsFormatted}</p>
              <hr class="my-2">
              <div class="d-flex justify-content-end gap-2">
                ${doiBtn}
                ${scholarBtn}
                ${downloadBtn}
              </div>
            </div>
          </div>
        `;

        container.appendChild(col);
      });
    }

    // Filter logic
    function applyFilters() {
      const textQuery = document.getElementById('filter-text').value.toLowerCase().trim();
      const typeFilter = document.getElementById('filter-type').value;

      const filtered = sortedPapers.filter(paper => {
        // Text filter: search in title, venue, and authors
        if (textQuery) {
          const searchable = [
            paper.title,
            paper.venue,
            paper.authors.join(' ')
          ].join(' ').toLowerCase();
          if (!searchable.includes(textQuery)) return false;
        }

        // Year filter (if any years are selected, only show those)
        if (selectedYears.size > 0 && !selectedYears.has(paper.year)) return false;

        // Type filter
        if (typeFilter && paper.type !== typeFilter) return false;

        return true;
      });

      renderPapers(filtered);
    }

    // Attach event listeners
    document.getElementById('filter-text').addEventListener('input', applyFilters);
    document.getElementById('filter-type').addEventListener('change', applyFilters);

    // Initial render with all papers
    renderPapers(sortedPapers);

    // Selected Work / Featured papers — hand-picked via `featured: true` in
    // the JSON. They render above the filters, keep the regular card
    // structure but with a red accent border, a FEATURED badge, and an
    // optional italic `featuredNote` under the authors. Featured papers
    // also remain in the full list below.
    const featuredPapers = papers
      .filter(p => p.featured)
      .sort((a, b) => b.year - a.year);

    const featuredSection = document.getElementById('publications_featured_section');
    const featuredContainer = document.getElementById('publications_featured_inner');

    if (featuredSection && featuredContainer && featuredPapers.length > 0) {
      featuredSection.style.display = '';
      renderFeatured(featuredPapers);
    }

    function renderFeatured(list) {
      featuredContainer.innerHTML = '';
      list.forEach(paper => {
        const authorsFormatted = paper.authors
          .map(a => a === 'Stefano Lambiase' ? '<strong>S. Lambiase</strong>' : a)
          .join(', ');

        const downloadBtn = paper.downloadLink
          ? `<a class="btn btn-success btn-sm" href="${paper.downloadLink}" download>Download</a>`
          : `<button class="btn btn-success btn-sm disabled" type="button" disabled>Not available</button>`;

        const doiBtn = paper.doi
          ? `<a class="btn btn-primary btn-sm" href="https://doi.org/${paper.doi}" target="_blank" rel="noopener noreferrer">DOI</a>`
          : '';

        const scholarQuery = encodeURIComponent(paper.title);
        const scholarBtn = `<a class="btn btn-warning btn-sm" href="https://scholar.google.com/scholar?q=${scholarQuery}" target="_blank" rel="noopener noreferrer">Scholar</a>`;

        const featuredNoteHtml = paper.featuredNote
          ? `<p class="paper-featured-note small fst-italic text-muted mb-2">${paper.featuredNote}</p>`
          : '';

        const col = document.createElement('div');
        col.classList.add('col-lg-10', 'pb-3');

        col.innerHTML = `
          <div class="card paper-featured h-100">
            <div class="card-body d-flex flex-column">
              <div class="mb-2 d-flex justify-content-between align-items-start flex-wrap gap-1">
                <div>
                  <span class="badge ${paper.type === 'journal' ? 'bg-success' : 'bg-info'}">${paper.type}</span>
                  <span class="badge ${paper.type === 'journal' ? 'bg-success' : 'bg-info'}">${paperLabels.get(paper)}</span>
                  <span class="badge bg-secondary">${paper.year}</span>
                </div>
                <span class="badge paper-featured-badge">Featured</span>
              </div>
              <h6 class="card-title"><strong>${paper.title}</strong></h6>
              <p class="card-text text-muted small mb-1">${paper.venue}</p>
              <p class="card-text small mb-1">${authorsFormatted}</p>
              ${featuredNoteHtml}
              <hr class="my-2">
              <div class="d-flex justify-content-end gap-2">
                ${doiBtn}
                ${scholarBtn}
                ${downloadBtn}
              </div>
            </div>
          </div>
        `;
        featuredContainer.appendChild(col);
      });
    }
  })
  .catch(error => console.error(error));
