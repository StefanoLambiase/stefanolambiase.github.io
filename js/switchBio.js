function switchBioFunction () {
    // Select the bio switch (use the bio-specific class so we don't collide
    // with the light/dark mode switch that also carries .switch-mode).
    const btn = document.querySelector(".switch-bio");
    // Select the two bio variants.
    const informalBio = document.querySelector(".bio-informal");
    const formalBio = document.querySelector(".bio-formal");

    if (!btn || !informalBio || !formalBio) return;

    // Listen for a change on the switch.
    btn.addEventListener("change", function () {
        if (btn.checked) {
            // Formal mode: show the formal bio, hide the informal one.
            informalBio.style.display = "none";
            formalBio.style.display = "";
        } else {
            // Default / informal mode.
            informalBio.style.display = "";
            formalBio.style.display = "none";
        }
    });
}

switchBioFunction();
