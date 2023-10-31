function switchModeFunction () {
    // Select the switch button.
    const btn = document.querySelector(".switch-mode");
    // Select the stylesheet <link>.
    const theme = document.querySelector("#theme-link");
    // Select the switch button label.
    const switchLabel = document.querySelector(".form-check-label");
    // Select all cards.
    const cards = document.querySelectorAll(".card");
    // Select CV Image.
    const cvImage = document.querySelector(".user-image");

    // Listen for a click on the button
    btn.addEventListener("click", function() {
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
            cvImage.src = "./assets/images/foto_della_distruzione.jpg";
        } else {
            // ... switch it to "light-theme.css"
            theme.href = "assets/css/minimalist-light-theme.css";

            // Change cards using bootstrap classes.
            cards.forEach( (item) => {
                item.classList.remove('text-white');
                item.classList.remove('bg-dark');
            });

            switchLabel.textContent = 'Light Mode';
            cvImage.src = "./assets/images/CVImage_2.jpg";
        }
    });
}

switchModeFunction();
