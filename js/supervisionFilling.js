// supervisionFilling.js

// Renders PhD students from jsons/supervision.json.
// Shape:
// {
//   "phdStudents": [ { firstName, lastName, affiliation, thesis,
//                      website, photo,
//                      mainSupervisor?, mainSupervisorUrl? } ]
// }
// mainSupervisor is displayed as a small "Co-supervised with …" line
// whenever present — i.e. Stefano is a co-supervisor and someone else
// is the primary supervisor. Omit the field when Stefano is the main.

fetch('jsons/supervision.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    renderPeople(
      document.getElementById('phd-students-container'),
      data.phdStudents || [],
      'No PhD students listed yet.'
    );
  })
  .catch(error => console.error('Error loading supervision data:', error));

function renderPeople(container, people, emptyMessage) {
  if (!container) return;

  if (people.length === 0) {
    container.innerHTML =
      `<div class="col text-center text-muted py-4">${emptyMessage}</div>`;
    return;
  }

  people.forEach(person => {
    const fullName = [person.firstName, person.lastName].filter(Boolean).join(' ');
    const photo = person.photo || 'assets/images/supervision/placeholder.jpg';
    const affiliation = person.affiliation || '';
    const thesis = person.thesis || '';
    const website = person.website;

    // Affiliation rendered as a card subtitle, matching the pattern used
    // in the Projects tab (card-title + card-subtitle).
    const affiliationLine = affiliation
      ? `<h6 class="card-subtitle text-muted small mb-1">${affiliation}</h6>`
      : '';

    // Main-supervisor line: shown only when Stefano is NOT the main supervisor.
    // If a URL is provided, render the name as a link.
    let mainSupLine = '';
    if (person.mainSupervisor) {
      const mainSupName = person.mainSupervisorUrl
        ? `<a href="${person.mainSupervisorUrl}" target="_blank" rel="noopener">${person.mainSupervisor}</a>`
        : person.mainSupervisor;
      mainSupLine = `<p class="card-text text-muted small fst-italic mb-0 mt-1">Co-supervised with ${mainSupName}</p>`;
    }

    // Website link rendered as a small globe icon, consistent with Experience cards.
    const websiteLink = website
      ? `<ul class="list-inline social-icons mb-0 mt-2">
           <li class="list-inline-item">
             <a href="${website}" target="_blank" rel="noopener" data-toggle="tooltip" data-placement="bottom" title="Personal website">
               <em class="fa fa-globe"></em>
             </a>
           </li>
         </ul>`
      : '';

    const col = document.createElement('div');
    col.classList.add('col-lg-6', 'pb-3');

    col.innerHTML = `
      <div class="card h-100">
        <div class="card-body d-flex align-items-start">
          <img src="${photo}" alt="${fullName}" class="rounded-circle me-3"
               style="width: 90px; height: 90px; object-fit: cover; flex-shrink: 0;">
          <div class="flex-grow-1">
            <h6 class="card-title mb-1"><strong>${fullName}</strong></h6>
            ${affiliationLine}
            ${thesis ? `<p class="card-text text-muted small mb-0">${thesis}</p>` : ''}
            ${mainSupLine}
            ${websiteLink}
          </div>
        </div>
      </div>
    `;

    container.appendChild(col);
  });
}
