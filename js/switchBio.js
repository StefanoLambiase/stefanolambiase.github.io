function switchBioFunction () {
    // Select the bio switch (use the bio-specific class so we don't collide
    // with the light/dark mode switch that also carries .switch-mode).
    const btn = document.querySelector(".switch-bio");
    // Select the two bio variants.
    const informalBio = document.querySelector(".bio-informal");
    const formalBio = document.querySelector(".bio-formal");

    if (!btn || !informalBio || !formalBio) return;

    // Apply the current mode everywhere: the bio paragraphs plus any element
    // flagged as `.informal-only` (e.g. the Unsolicited Opinions tab/panel).
    const applyMode = (isFormal) => {
        if (isFormal) {
            informalBio.style.display = "none";
            formalBio.style.display = "";
        } else {
            informalBio.style.display = "";
            formalBio.style.display = "none";
        }

        const informalOnly = document.querySelectorAll(".informal-only");
        informalOnly.forEach((el) => {
            el.style.display = isFormal ? "none" : "";
        });

        // Edge case: if formal mode is on and the active tab happens to be
        // an informal-only tab, fall back to the first available tab so the
        // content area doesn't end up empty.
        if (isFormal) {
            const activeInformalTab = document.querySelector(
                "#content-tabs a.informal-only.active"
            );
            if (activeInformalTab) {
                const fallback = document.querySelector(
                    "#content-tabs a:not(.informal-only)"
                );
                if (fallback && window.bootstrap && window.bootstrap.Tab) {
                    const tab = new window.bootstrap.Tab(fallback);
                    tab.show();
                } else if (fallback) {
                    // Fallback to a plain click if bootstrap's Tab API isn't
                    // available for any reason.
                    fallback.click();
                }
            }
        }
    };

    // Initial pass in case the switch is pre-checked (e.g. after a reload
    // where the browser restored the checkbox state).
    applyMode(btn.checked);

    // Listen for a change on the switch.
    btn.addEventListener("change", function () {
        applyMode(btn.checked);
    });
}

switchBioFunction();
