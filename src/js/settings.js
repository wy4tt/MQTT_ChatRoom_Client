window.addEventListener("load", function () {
    currTheme = localStorage.getItem("theme");
    isThemeAuto = localStorage.getItem("auto_theme");

    if (currTheme === "theme_light") {
        setTheme("theme_light");
    } else if (currTheme === "theme_dark") {
        setTheme("theme_dark");
    }

    if (isThemeAuto === "true") {
        changeActiveMark(true, "auto_active");
    } else if (currTheme === "theme_light") {
        changeActiveMark(true, "light_active");
    } else if (currTheme === "theme_dark") {
        changeActiveMark(true, "dark_active");
    }


    document.getElementById("none_active").style.display = "none";
    document.getElementById("status_active").style.display = "none";
    document.getElementById("message_active").style.display = "none";
    currNotify = localStorage.getItem("notify");
    if (currNotify == "none") {
        changeActiveMark(false, "none_active");
    }
    else if (currNotify == "both") {
        changeActiveMark(false, "status_active");
        changeActiveMark(false, "message_active");
    }
    else if (currNotify == "status") {
        changeActiveMark(false, "status_active");
    }
    else if (currNotify == "messages") {
        changeActiveMark(false, "message_active");
    }
});

document.getElementById("backBtn").addEventListener("click", function () {
    document.getElementById("settingsModal").style.display = "none";
    updateNotifications()
});

document.getElementById("theme_light").addEventListener("click", function () {
    localStorage.setItem("auto_theme", false);
    setTheme("theme_light");
    changeActiveMark(true, "light_active");
});
document.getElementById("theme_dark").addEventListener("click", function () {
    localStorage.setItem("auto_theme", false);
    setTheme("theme_dark");
    changeActiveMark(true, "dark_active");
});
document.getElementById("theme_auto").addEventListener("click", function () {
    localStorage.setItem("auto_theme", true);
    autoSetTheme();
    changeActiveMark(true, "auto_active");
});

document.getElementById("notify_none").addEventListener("click", function () {
    changeActiveMark(false, "none_active");
});
document.getElementById("notify_status").addEventListener("click", function () {
    changeActiveMark(false, "status_active");
});
document.getElementById("notify_message").addEventListener("click", function () {
    changeActiveMark(false, "message_active");
});


function changeActiveMark(theme, whichCheck) {
    if (theme) {
        document.getElementById("light_active").style.display = "none";
        document.getElementById("dark_active").style.display = "none";
        document.getElementById("auto_active").style.display = "none";

        document.getElementById(whichCheck).style.display = "inline";
    }
    else {
        if (whichCheck == "none_active") {
            document.getElementById("none_active").style.display = "none";
            document.getElementById("status_active").style.display = "none";
            document.getElementById("message_active").style.display = "none";

            document.getElementById(whichCheck).style.display = "inline";
        }
        else {
            document.getElementById("none_active").style.display = "none";

            if (document.getElementById(whichCheck).style.display == "none") {
                document.getElementById(whichCheck).style.display = "inline";
            }
            else {
                document.getElementById(whichCheck).style.display = "none";
            }

            if (document.getElementById("status_active").style.display == "none" && document.getElementById("message_active").style.display == "none") {
                document.getElementById("none_active").style.display = "inline";
            }
        }

        if (document.getElementById("none_active").style.display == "inline") {
            setNotify("none");
        }
        else if (document.getElementById("status_active").style.display == "inline" && document.getElementById("message_active").style.display == "inline") {
            setNotify("both");
        }
        else if (document.getElementById("status_active").style.display == "inline") {
            setNotify("status");
        }
        else if (document.getElementById("message_active").style.display == "inline") {
            setNotify("messages");
        }
    }
}

// function to set what notifications to receive
function setNotify(notifyMode) {
    localStorage.setItem("notify", notifyMode);
}