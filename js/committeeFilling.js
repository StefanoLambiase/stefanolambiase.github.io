// script.js

// Funzione per leggere il file JSON e generare i div delle esperienze
fetch('jsons/committee.json') // Cambia il nome del file se necessario
.then(response => {
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
})
.then(data => {
  const committeesContainer = document.getElementById('committee-container');
  const experiences = data.committees;

  experiences.forEach(experience => {
    if (experience.token == 'Committee member') {
        const div = document.createElement('div');
        div.classList.add('timeline-block');

        if (experiences.indexOf(experience) % 2 === 0) {
        div.classList.add('timeline-block-left');

        div.innerHTML = `
            <div class="timeline-content">
            <h3 class="timeline-h3">${experience.title}</h3>
            <span class="timeline-span">${experience.location}</span>
            <p class="text-muted small mb-3">${experience.date}</p>
            <p class="timeline-p text-justify">${experience.description}</p>
            </div>
            <div class="marker"></div>
        `;
        } else {
        div.classList.add('timeline-block-right');
        div.innerHTML = `
            <div class="marker"></div>
            <div class="timeline-content">
            <h3 class="timeline-h3">${experience.title}</h3>
            <span class="timeline-span">${experience.location}</span>
            <p class="text-muted small mb-3">${experience.date}</p>
            <p class="timeline-p text-justify">${experience.description}</p>
            </div>
        `;
        }

        if (experience.link) {
        const link = document.createElement('a');
        link.href = experience.link;
        link.target = '_blank';
        link.innerHTML = '<em class="fa fa-globe"></em>';
        const socialIcons = document.createElement('ul');
        socialIcons.classList.add('list-inline', 'social-icons');
        socialIcons.appendChild(link);
        div.querySelector('.timeline-content').appendChild(socialIcons);
        }

        committeesContainer.appendChild(div);
    }
  })
})
.catch(error => console.error(error));
