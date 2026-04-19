function switchModeFunction () {
    // Select the switch button.
    const btn = document.querySelector(".switch-mode");
    // Select the stylesheet <link>.
    const theme = document.querySelector("#theme-link");
    // Select the switch button label.
    const switchLabel = document.querySelector(".form-check-label");
    // Select CV Image.
    const cvImage = document.querySelector(".user-image");
    // Select photo balloon.
    const photoBalloon = document.querySelector(".photo-balloon");

    // Listen for a click on the button
    btn.addEventListener("click", function() {
        // Re-query cards on each click so that dynamically-injected cards
        // (e.g. from *Filling.js scripts that fetch JSON asynchronously)
        // also pick up the theme classes.
        const cards = document.querySelectorAll(".card");

        // If the current URL contains "ligh-theme.css"
        if (theme.getAttribute("href") == "assets/css/minimalist-light-theme.css") {
            // ... then switch it to "dark-theme.css"
            theme.href = "assets/css/minimalist-dark-theme.css";

            // Change cards using bootstrap classes.
            cards.forEach( (item) => {
                item.classList.add('text-white');
                item.classList.add('bg-dark');
            });

            switchLabel.textContent = 'Dark Mode';
            cvImage.src = "./assets/images/meme_pollo.jpeg";
            photoBalloon.style.display = "block";
        } else {
            // ... switch it to "light-theme.css"
            theme.href = "assets/css/minimalist-light-theme.css";

            // Change cards using bootstrap classes.
            cards.forEach( (item) => {
                item.classList.remove('text-white');
                item.classList.remove('bg-dark');
            });

            switchLabel.textContent = 'Light Mode';
            cvImage.src = "./assets/images/new_ste.JPG";
            photoBalloon.style.display = "none";
        }
    });
}

switchModeFunction();
