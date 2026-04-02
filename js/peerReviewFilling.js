// peerReviewFilling.js

// Fetch peerReview.json and generate the peer review section
fetch('jsons/peerReview.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    const container = document.getElementById('peer-review-container');

    // Summary line
    const summary = document.createElement('div');
    summary.classList.add('text-center', 'mb-4');
    summary.innerHTML = `
      <p class="text-muted">
        <strong>${data.totalReviews}</strong> reviews for <strong>${data.totalPublications}</strong> journals
      </p>
    `;
    container.appendChild(summary);

    // Table
    const tableWrapper = document.createElement('div');
    tableWrapper.classList.add('table-responsive');

    const table = document.createElement('table');
    table.classList.add('table', 'table-hover');

    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th scope="col">Journal</th>
        <th scope="col" class="text-center">Reviews</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    // Sort by count descending
    const sorted = [...data.reviews].sort((a, b) => b.count - a.count);

    sorted.forEach(entry => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${entry.journal}</td>
        <td class="text-center"><span class="badge bg-secondary">${entry.count}</span></td>
      `;
      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    container.appendChild(tableWrapper);
  })
  .catch(error => console.error(error));
