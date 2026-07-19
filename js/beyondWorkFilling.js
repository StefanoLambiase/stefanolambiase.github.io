// beyondWorkFilling.js
// Populates the "Life Moments" timeline in the Beyond Work tab.
// Same structure as the Experience timeline, with optional images.

fetch('jsons/beyondWork.json')
.then(response => {
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
})
.then(data => {
  const container = document.getElementById('beyond-work-container');
  const moments = data.moments;

  moments.forEach((moment, index) => {
    const div = document.createElement('div');
    div.classList.add('timeline-block');

    // Optional image shown inside the timeline card
    const imageHTML = moment.image
      ? `<img src="${moment.image}" alt="${moment.imageAlt || moment.title}" class="timeline-image" loading="lazy">`
      : '';

    const contentHTML = `
      <div class="timeline-content">
        <h3 class="timeline-h3">${moment.title}</h3>
        <span class="timeline-span">${moment.location}</span>
        <p class="text-muted small mb-3">${moment.date}</p>
        <p class="timeline-p text-justify">${moment.description}</p>
        ${imageHTML}
      </div>
    `;

    if (index % 2 === 0) {
      div.classList.add('timeline-block-left');
      div.innerHTML = `${contentHTML}<div class="marker"></div>`;
    } else {
      div.classList.add('timeline-block-right');
      div.innerHTML = `<div class="marker"></div>${contentHTML}`;
    }

    if (moment.link) {
      const link = document.createElement('a');
      link.href = moment.link;
      link.target = '_blank';
      link.innerHTML = '<em class="fa fa-globe"></em>';
      const socialIcons = document.createElement('ul');
      socialIcons.classList.add('list-inline', 'social-icons');
      socialIcons.appendChild(link);
      div.querySelector('.timeline-content').appendChild(socialIcons);
    }

    container.appendChild(div);
  })

  // Collapse the tail of the timeline behind a "show more" button.
  const VISIBLE_COUNT = 8;
  const blocks = Array.from(container.querySelectorAll('.timeline-block'));
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
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    wrapper.appendChild(btn);
    container.after(wrapper);
  }
})
.catch(error => console.error(error));
