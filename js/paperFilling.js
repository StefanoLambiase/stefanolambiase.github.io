// script.js

// Funzione per leggere il file JSON e generare i div dei paper
fetch('jsons/papers.json') // Assicurati di utilizzare il percorso corretto del tuo file JSON
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    const publicationsContainer = document.getElementById('publications_inner');
    const papers = data;

    papers.forEach((paper, index) => {
      const div = document.createElement('div');
      div.classList.add('col-lg-8', 'pb-3', 'cards-list');

      div.innerHTML = `
        <div class="card">
            <div class="card-body">
                <div class="d-flex justify-content-between">
                    <div class="p-2 align-self-center">
                        <span class="badge bg-success">
                            ${paper.type}
                        </span>
                        <span class="badge bg-danger">
                            ${paper.acronym_key}
                        </span>
                        <span class="badge bg-secondary">
                            ${paper.year}
                        </span>
                    </div>
                </div>
                <h5 class="card-title"><strong>${paper.title}</strong></h5>
                <h6>${paper.source}</h6>
                <div class="d-flex justify-content-between">
                    <div class="p-2 align-self-center">
                        <span class="badge bg-info">
                            ${paper.topic_list}
                        </span>
                    </div>
                    <div class="p-2">
                        <button class="btn btn-publication btn-sm" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_${index}" aria-expanded="false" aria-controls="collapse_${index}">
                            Abstract
                        </button>
                        <button class="btn btn-publication btn-sm" type="button">
                            <a class="download-pub" href="${paper.downloadLink}" download>Download</a>
                        </button>
                    </div>
                </div>

                <div class="collapse" id="collapse_${index}">
                    <div class="card card-body">
                        <p class="card-text abstract-text">
                            ${paper.abstract}
                        </p>
                    </div>
                </div>

                <p class="card-text">
                </p>
                <hr>
                <div class="d-flex justify-content-between">
                    <div class="p-2"></div>
                    <div class="p-2">${paper.authors}</div>
                </div>
            </div>
        </div>
      `;

      publicationsContainer.appendChild(div);

      // Aggiungi il separatore se non è l'ultimo paper
      if (index < papers.length - 1) {
        const separator = document.createElement('div');
        separator.classList.add('w-100');
        publicationsContainer.appendChild(separator);
      }
    });
  })
  .catch(error => console.error(error));
