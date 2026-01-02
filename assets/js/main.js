// Optional: only allow one audience dropdown open at a time
const dropdowns = document.querySelectorAll(".dropdown");
dropdowns.forEach(d => {
  d.addEventListener("toggle", () => {
    if (!d.open) return;
    dropdowns.forEach(other => {
      if (other !== d) other.open = false;
    });
  });
});
