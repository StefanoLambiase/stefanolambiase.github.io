// tempNewsFilling.js

// Fetch tempNews.json and render the small "temp news" strip that sits just
// above the main tab menu. The strip is hand-edited: change the items in the
// JSON (or set "show": false) and the site picks it up on reload.
fetch('jsons/tempNews.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    const strip = document.getElementById('temp-news');
    if (!strip || !data.show || !Array.isArray(data.items)) return;

    let rendered = 0;
    data.items.forEach(item => {
      if (!item.text) return;

      // A pill is an <a> when a link is provided, a <span> otherwise.
      const pill = document.createElement(item.link ? 'a' : 'span');
      pill.classList.add('temp-news-item');
      if (item.informalOnly) pill.classList.add('informal-only');
      if (item.link) {
        pill.href = item.link;
        pill.target = '_blank';
        pill.rel = 'noopener noreferrer';
      }

      const iconHtml = item.icon ? `<em class="${item.icon}" aria-hidden="true"></em>` : '';
      const labelHtml = item.label ? `<span class="temp-news-label">${item.label}</span>` : '';
      pill.innerHTML = `<span class="temp-news-dot" aria-hidden="true"></span>${iconHtml}${labelHtml}<span>${item.text}</span>`;

      strip.appendChild(pill);
      rendered++;
    });

    if (rendered === 0) return;

    // Respect the Formal Bio switch if it is already on when the strip is
    // injected (switchBio.js applies the mode to .informal-only elements
    // only on load and on toggle, and this fetch resolves after load).
    const bioSwitch = document.querySelector('.switch-bio');
    if (bioSwitch && bioSwitch.checked) {
      strip.querySelectorAll('.informal-only').forEach(el => {
        el.style.display = 'none';
      });
    }

    // Clearing the inline display restores the d-flex class on the container.
    strip.style.display = '';
  })
  .catch(error => console.error(error));
