// script.js

// Funzione per leggere il file JSON e generare i div delle esperienze
fetch('jsons/experiences.json') // Cambia il nome del file se necessario
.then(response => {
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
})
.then(data => {
  const experienceContainer = document.getElementById('experience-container');
  const experiences = data.experiences;

  experiences.forEach((experience, index) => {
    const div = document.createElement('div');
    div.classList.add('timeline-block');
    div.classList.add(index % 2 === 0 ? 'timeline-block-left' : 'timeline-block-right');

    // Optional image shown inside the timeline card
    const imageHTML = experience.image
      ? `<img src="${experience.image}" alt="${experience.imageAlt || experience.title}" class="timeline-image" loading="lazy">`
      : '';

    // Title, location and date are always visible; description, image and
    // link live in a collapsible block opened by the small chevron button
    // next to the title (or by clicking the title itself). Set
    // `"expanded": true` on an entry in the JSON to open it by default.
    const detailsId = `experience-details-${index}`;
    const startOpen = experience.expanded === true;

    const contentHTML = `
      <div class="timeline-content">
        <div class="timeline-header">
          <h3 class="timeline-h3">${experience.title}</h3>
          <button type="button" class="timeline-toggle" aria-expanded="${startOpen}" aria-controls="${detailsId}" aria-label="Show details">
            <em class="fa fa-chevron-down" aria-hidden="true"></em>
          </button>
        </div>
        <span class="timeline-span">${experience.location}</span>
        <p class="text-muted small mb-3">${experience.date}</p>
        <div class="timeline-details" id="${detailsId}">
          <div class="timeline-details-inner">
            <p class="timeline-p text-justify">${experience.description}</p>
            ${imageHTML}
          </div>
        </div>
      </div>
    `;

    // Left blocks: content then marker; right blocks: marker then content.
    div.innerHTML = index % 2 === 0
      ? `${contentHTML}<div class="marker"></div>`
      : `<div class="marker"></div>${contentHTML}`;

    if (experience.link) {
      const link = document.createElement('a');
      link.href = experience.link;
      link.target = '_blank';
      link.innerHTML = '<em class="fa fa-globe"></em>';
      const socialIcons = document.createElement('ul');
      socialIcons.classList.add('list-inline', 'social-icons');
      socialIcons.appendChild(link);
      div.querySelector('.timeline-details-inner').appendChild(socialIcons);
    }

    // Expand/collapse behaviour
    const header = div.querySelector('.timeline-header');
    const toggle = div.querySelector('.timeline-toggle');
    const details = div.querySelector('.timeline-details');
    const setOpen = (open) => {
      details.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Hide details' : 'Show details');
      // Keep links inside a collapsed block out of the tab order.
      if (open) details.removeAttribute('inert');
      else details.setAttribute('inert', '');
    };
    setOpen(startOpen);
    // A click on the button bubbles up to the header, so one listener is enough.
    header.addEventListener('click', () => setOpen(!details.classList.contains('is-open')));

    experienceContainer.appendChild(div);
  })

  // Collapse the tail of the timeline behind a "show more" button.
  const VISIBLE_COUNT = 8;
  const blocks = Array.from(experienceContainer.querySelectorAll('.timeline-block'));
  if (blocks.length > VISIBLE_COUNT) {
    const hiddenBlocks = blocks.slice(VISIBLE_COUNT);
    hiddenBlocks.forEach(block => { block.style.display = 'none'; });

    const wrapper = document.createElement('div');
    wrapper.classList.add('text-center', 'mb-4');

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.classList.add('btn', 'btn-publication', 'btn-sm');

    let expanded = false;
    const setLabel = () => {
      btn.innerHTML = expanded
        ? '<em class="fa fa-chevron-up me-2"></em>Show less'
        : `<em class="fa fa-chevron-down me-2"></em>Show ${hiddenBlocks.length} more`;
    };
    setLabel();

    btn.addEventListener('click', () => {
      expanded = !expanded;
      hiddenBlocks.forEach(block => { block.style.display = expanded ? '' : 'none'; });
      setLabel();
      // When collapsing, bring the top of the timeline back into view.
      if (!expanded) {
        experienceContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    wrapper.appendChild(btn);
    experienceContainer.after(wrapper);
  }
})
.catch(error => console.error(error));
