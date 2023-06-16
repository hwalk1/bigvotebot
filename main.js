//TODO;
// Import both voting options - DONE
// Automatic Refresh -
  // Idea, I need to host a html page locally when the app is running to serve
  // that to OBS for rendering of the votes

// Visual Styling

let container;
container = $(".main-container");
// This needs to fire on message recieved
  fetch("db.json")
    .then((response) => response.json())
    .then((data) =>
      container.html(
        `<h1>Which font should we use?</h1>
        <h2>${data.totalVotes[0].option}: ${data.totalVotes[0].total}</h2>
        <h2>${data.totalVotes[1].option}: ${data.totalVotes[1].total}</h2>`
      )
    )
    .catch((error) => console.log(error));
