// function to set a given theme/color-scheme
function setTheme(themeName) {
  localStorage.setItem("theme", themeName);
  document.documentElement.className = themeName;
}

function autoSetTheme() {
  var today = new Date();
  var currHour = today.getHours();

  if (currHour >= 17) {
    setTheme("theme_dark");
  } else if (currHour >= 8) {
    setTheme("theme_light");
  }
}

// Immediately invoked function to set the theme on initial load
(function () {
  if (localStorage.getItem("theme") === "theme_dark") {
    setTheme("theme_dark");
  } else {
    setTheme("theme_light");
  }
})();

window.setInterval(function () {
  if (localStorage.getItem("auto_theme") === "true") {
    autoSetTheme();
  }
}, 3000);
