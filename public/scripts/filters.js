const toggleFilter = (event) => {
  console.log("running toggleFilter");
  const filter = event.target;
  if (filter.className === "filter btn btn-success") {
    filter.className = "filter btn btn-secondary";
    filter.value = "";
    return;
  }
  filter.className = "filter btn btn-success";
  filter.value = filter.name.replace("_", " ");
};

document.querySelectorAll(".filter").forEach((filter) => {
  filter.addEventListener("click", toggleFilter);
});
