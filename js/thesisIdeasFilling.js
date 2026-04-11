// thesisIdeasFilling.js

// Fetch thesisIdeas.json and generate cards with PDF download links
fetch('jsons/thesisIdeas.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    const container = document.getElementById('thesis-ideas-container');
    const ideas = data.thesisIdeas;

    if (ideas.length === 0) {
      container.innerHTML = '<div class="col text-center text-muted py-4">No thesis ideas available at the moment. Check back later!</div>';
      return;
    }

    ideas.forEach(idea => {
      // Build tags badges
      const tagsBadges = (idea.tags || [])
        .map(tag => `<span class="badge bg-secondary me-1 mb-1">${tag}</span>`)
        .join('');

      // Build level badges (supports string or array)
      const levels = Array.isArray(idea.level) ? idea.level : (idea.level ? [idea.level] : []);
      const levelBadges = levels
        .map(l => `<span class="badge bg-info me-1 mb-1">${l}</span>`)
        .join('');

      // Build download button
      const downloadBtn = idea.downloadLink
        ? `<a class="btn btn-success btn-sm" href="${idea.downloadLink}" target="_blank"><em class="fa-solid fa-file-pdf me-1"></em>View PDF</a>`
        : `<button class="btn btn-success btn-sm disabled" type="button" disabled>PDF coming soon</button>`;

      const col = document.createElement('div');
      col.classList.add('col-lg-6', 'pb-3');

      col.innerHTML = `
        <div class="card h-100">
          <div class="card-body d-flex flex-column">
            <div class="mb-2">
              ${levelBadges}
              ${tagsBadges}
            </div>
            <h6 class="card-title"><strong>${idea.title}</strong></h6>
            <p class="card-text text-muted small mt-auto pt-2">${idea.description}</p>
            <hr class="my-2">
            <div class="d-flex justify-content-end gap-2">
              ${downloadBtn}
            </div>
          </div>
        </div>
      `;

      container.appendChild(col);
    });
  })
  .catch(error => console.error('Error loading thesis ideas:', error));
