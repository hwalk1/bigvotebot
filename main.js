let container = $(".main-container");

function fetchDataAndUpdateHTML() {
  fetch("db.json")
    .then((response) => response.json())
    .then((data) =>
      container.html(
        `<h1>Which Repo?</h1>
        <h2>${data.totalVotes[0].option}: ${data.totalVotes[0].total}</h2>
        <h2>${data.totalVotes[1].option}: ${data.totalVotes[1].total}</h2>`
      )
    )
    .catch((error) => console.log(error));
}

// Call the function initially
fetchDataAndUpdateHTML();

// Periodically check for updates
setInterval(fetchDataAndUpdateHTML, 5000); // Update every 5 seconds
