const statusDivs = document.querySelectorAll(".status");
statusDivs.forEach((statusDiv) => {
  statusDiv.className += ` ${statusDiv.innerText}`;
});
