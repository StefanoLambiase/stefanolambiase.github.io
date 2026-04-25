// supervisionFilling.js

// Renders PhD students and close collaborators from jsons/supervision.json.
// Shape:
// {
//   "phdStudents":         [ { firstName, lastName, affiliation, thesis,
//                              website, photo,
//                              mainSupervisor?, mainSupervisorUrl?,
//                              closeCollaboration? } ],
//   "closeCollaborators":  [ { firstName, lastName, affiliation,
//                              website, photo } ]
// }
//
// In phdStudents:
//   - by default, mainSupervisor renders as "Co-supervised with X" — i.e.
//     Stefano holds a formal co-supervisor role and someone else is the
//     primary supervisor. Omit mainSupervisor when Stefano is the main.
//   - if closeCollaboration: true is set on an entry, the label switches to
//     "Advised by X" instead — Stefano works closely with this PhD but is
//     not a formal (co-)supervisor.
//   - mainSupervisor accepts either a string (single advisor — pair with
//     optional mainSupervisorUrl) OR an array of { name, url? } objects
//     (multiple advisors). The renderer joins multiple names with "and",
//     using an Oxford comma for three or more.
//
// In closeCollaborators: senior researchers Stefano collaborates with on a
// regular basis. They don't carry a supervisor relationship, so cards show
// only name, affiliation, and a link to their website.

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
      'No PhD students listed yet.',
      'Co-supervised with'
    );
    renderPeople(
      document.getElementById('close-collaborators-container'),
      data.closeCollaborators || [],
      'No close collaborators listed yet.',
      null
    );
  })
  .catch(error => console.error('Error loading supervision data:', error));

// Returns the advisor list as a uniform array of { name, url? } objects,
// regardless of whether the entry uses the simple string form
// (mainSupervisor + mainSupervisorUrl) or the array form
// (mainSupervisor: [{ name, url? }, …]).
function normalizeAdvisors(person) {
  if (Array.isArray(person.mainSupervisor)) {
    return person.mainSupervisor.filter(a => a && a.name);
  }
  if (typeof person.mainSupervisor === 'string' && person.mainSupervisor) {
    return [{ name: person.mainSupervisor, url: person.mainSupervisorUrl }];
  }
  return [];
}

function renderPeople(container, people, emptyMessage, defaultSupervisorLabel) {
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

    // Supervisor line: only rendered if a section-level label is set and the
    // entry carries advisor information. Per-entry closeCollaboration flag
    // overrides the section default with "Advised by".
    let mainSupLine = '';
    const advisors = normalizeAdvisors(person);
    if (advisors.length > 0 && defaultSupervisorLabel) {
      const label = person.closeCollaboration ? 'Advised by' : defaultSupervisorLabel;
      const advisorHtml = advisors
        .map(a => a.url
          ? `<a href="${a.url}" target="_blank" rel="noopener">${a.name}</a>`
          : a.name);
      let joined;
      if (advisorHtml.length === 1) {
        joined = advisorHtml[0];
      } else if (advisorHtml.length === 2) {
        joined = `${advisorHtml[0]} and ${advisorHtml[1]}`;
      } else {
        joined = `${advisorHtml.slice(0, -1).join(', ')}, and ${advisorHtml[advisorHtml.length - 1]}`;
      }
      mainSupLine = `<p class="card-text text-muted small fst-italic mb-0 mt-1">${label} ${joined}</p>`;
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
