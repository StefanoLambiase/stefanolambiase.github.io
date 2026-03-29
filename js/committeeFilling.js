// committeeFilling.js

// Fetch committee.json and generate the timeline with year nodes
fetch('jsons/committee.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    const container = document.getElementById('committee-container');
    const committees = data.committees;

    committees.forEach((entry, index) => {
      const div = document.createElement('div');
      div.classList.add('timeline-block');

      // Build the list of conference acronyms
      const conferenceList = entry.conferences
        .map(c => c.role ? `<strong>${c.name}</strong> (${c.role})` : c.name)
        .join('; ');

      if (index % 2 === 0) {
        div.classList.add('timeline-block-left');
        div.innerHTML = `
          <div class="timeline-content">
            <h3 class="timeline-h3">${entry.year}</h3>
            <p class="timeline-p">${conferenceList}</p>
          </div>
          <div class="marker"></div>
        `;
      } else {
        div.classList.add('timeline-block-right');
        div.innerHTML = `
          <div class="marker"></div>
          <div class="timeline-content">
            <h3 class="timeline-h3">${entry.year}</h3>
            <p class="timeline-p">${conferenceList}</p>
          </div>
        `;
      }

      container.appendChild(div);
    });
  })
  .catch(error => console.error(error));
