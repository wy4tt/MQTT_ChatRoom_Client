const backBtn = document.getElementById("backBtn");
backBtn.addEventListener("click", exitSettings);

function exitSettings() {
  window.location = "../index.html";
}

function changeActiveMark(whichCheck) {
  document.getElementById("light_active").style.display = "none";
  document.getElementById("dark_active").style.display = "none";
  document.getElementById("auto_active").style.display = "none";

  document.getElementById(whichCheck).style.display = "inline";
}

document.getElementById("theme_light").addEventListener("click", function () {
  localStorage.setItem("auto_theme", false);
  setTheme("theme_light");
  changeActiveMark("light_active");
});
document.getElementById("theme_dark").addEventListener("click", function () {
  localStorage.setItem("auto_theme", false);
  setTheme("theme_dark");
  changeActiveMark("dark_active");
});
document.getElementById("theme_auto").addEventListener("click", function () {
  localStorage.setItem("auto_theme", true);
  autoSetTheme();
  changeActiveMark("auto_active");
});

// Immediately invoked function to set the theme on initial load
(function () {
  currTheme = localStorage.getItem("theme");
  isThemeAuto = localStorage.getItem("auto_theme");

  if (currTheme === "theme_light") {
    setTheme("theme_light");
  } else if (currTheme === "theme_dark") {
    setTheme("theme_dark");
  }

  if (isThemeAuto === "true") {
    changeActiveMark("auto_active");
  } else if (currTheme === "theme_light") {
    changeActiveMark("light_active");
  } else if (currTheme === "theme_dark") {
    changeActiveMark("dark_active");
  }
})();
