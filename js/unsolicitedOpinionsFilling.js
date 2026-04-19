// unsolicitedOpinionsFilling.js
//
// Fetch unsolicitedOpinions.json and build a single-column list of
// expandable cards. Each card shows a short "hot take" by default and
// reveals a longer rant when clicked.
//
// Note: we manage the expand/collapse state manually instead of relying
// on Bootstrap's `data-bs-toggle="collapse"`, because this page loads
// both Bootstrap 4 and Bootstrap 5 bundles and they can race on the
// toggle, causing the card not to close on the second click.

fetch('jsons/unsolicitedOpinions.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    const container = document.getElementById('unsolicited-opinions-container');
    if (!container) return;

    const opinions = data.unsolicitedOpinions || [];

    if (opinions.length === 0) {
      container.innerHTML = '<div class="col text-center text-muted py-4">No opinions here yet&mdash;somehow.</div>';
      return;
    }

    opinions.forEach((opinion, index) => {
      const bodyId = `unsolicited-body-${opinion.id || index}`;

      const tagBadge = opinion.tag
        ? `<span class="badge bg-secondary me-1 mb-2">${opinion.tag}</span>`
        : '';

      const col = document.createElement('div');
      col.classList.add('col-12', 'pb-3');

      col.innerHTML = `
        <div class="card unsolicited-card">
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
            </div>
          </div>
        </div>
      `;

      container.appendChild(col);

      // Wire up the manual expand/collapse behaviour.
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
    });
  })
  .catch(error => console.error('Error loading unsolicited opinions:', error));
