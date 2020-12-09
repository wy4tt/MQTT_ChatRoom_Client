let usersArray = [];

var notifyStatus = false;
var notifyMessage = false;

function updateNotifications() {
    var notifySetting = localStorage.getItem("notify");

    if (notifySetting == "none") {
        notifyStatus = false;
        notifyMessage = false;
    }
    else if (notifySetting == "both") {
        notifyStatus = true;
        notifyMessage = true;
    }
    else if (notifySetting == "status") {
        notifyStatus = true;
        notifyMessage = false;
    }
    else if (notifySetting == "messages") {
        notifyStatus = false;
        notifyMessage = true;
    }

    console.log(notifyStatus, notifyMessage);
}

document.getElementById("sideBtn").addEventListener("click", function () {
    alert("Under construction");
});

document.getElementById("connectBtn").addEventListener("click", function () {
    document.getElementById("connectModal").style.display = "block";
});

document.getElementById("disconnectBtn").addEventListener("click", function () {

    var really = confirm("Are you sure you want to disconnect?")

    if (really) {
        if (client.connected) {
            publishToChannel(true, netID + "/status", `{"name": "${name}", "online": 0}`);
            client.end()
            client.on('close', () => {
                console.log(options.clientId + ' disconnected')
            })
        }
    }
});

document.getElementById("settingsBtn").addEventListener("click", function () {
    document.getElementById("settingsModal").style.display = "block";
});

document.getElementById("modalConnectBtn").addEventListener("click", function () {

    updateNotifications();

    var config = { host, port, netID, name, cID, URL };
    config.host = document.getElementById("hostVal").value;
    config.port = document.getElementById("portVal").value;
    config.netID = document.getElementById("netIdVal").value;
    config.name =
        document.getElementById("nameVal").value.length == 0
            ? config.netID
            : document.getElementById("nameVal").value;
    config.cID = config.netID + "_" + Math.random().toString(16).substr(2, 4);
    config.URL = "mqtt://" + config.host + ":" + config.port;

    connect(config);
});

document.getElementById("modalCloseBtn").addEventListener("click", function () {
    document.getElementById("connectModal").style.display = "none";
});

document.getElementById("messageHolder").addEventListener("keydown", function (e) {
    if (e.keyCode === 13) {
        sendMessage()
    }
});


document.getElementById("sendBtn").addEventListener("click", function () {
    sendMessage()
});

function sendMessage() {
    var messageContents = document.getElementById("messageHolder").value;

    if (client == null || client.connected == false) {
        alert("Please connect your chat client");
    } else if (messageContents.length == 0) {
        alert("you gotta write something dude!");
    }
    else {
        const now = new Date()
        const utcMilllisecondsSinceEpoch = now.getTime();
        const utcSecondsSinceEpoch = Math.round(utcMilllisecondsSinceEpoch / 1000)

        const payload = `{"timestamp": ${utcSecondsSinceEpoch}, "name": "${name}", "message": "${messageContents}"}`;
        console.log(payload);

        today = new Date();
        day = today.getDate();
        month = today.getMonth();
        year = today.getFullYear();
        fullDate = (month + 1) + "/" + day + "/" + year;
        fullDate = fullDate + "&nbsp;" + today.toLocaleTimeString();

        // update the delivered flag using netID and the messageID (recNetID+timeStamp)
        let ul = document.querySelector("#messagesList");
        let li = document.createElement("li");

        var messageID = netID + utcSecondsSinceEpoch + '';

        li.innerHTML = `<div class="container">
                     <div id="${messageID}" class="message-body-me">
                         <b class="right_side">${name}</b><br>
                         <p class="right_side">${messageContents}</p><br>
                         <small class="right_side">${fullDate}</small><br>
                     </div>
                 </div>`;

        ul.appendChild(li);


        publishToChannel(false, netID + "/message", payload);
    }

}

document.getElementById("netIdVal").addEventListener("keyup", function () {
    var clientID = document.getElementById("netIdVal");
    var chatName = document.getElementById("nameVal");
    chatName.value = clientID.value;
});

function checkConnStatus() {

    console.log("checking");

    if (client == null) {
        disconnectBtn.style.display = "none";
        connectBtn.style.display = "block";

        modalConnectBtn.style.backgroundColor = "red";
        modalConnectBtn.innerText = "Connect";
    } else if (client.connected) {
        disconnectBtn.style.display = "block";
        connectBtn.style.display = "none";

        modalConnectBtn.style.backgroundColor = "green";
        modalConnectBtn.innerText = "Connected";
    } else {
        disconnectBtn.style.display = "none";
        connectBtn.style.display = "block";

        modalConnectBtn.style.backgroundColor = "red";
        modalConnectBtn.innerText = "Connect";
    }
}

function parseStatusUpdate(recNetID, statusContents) {

    if (recNetID == netID) {
        console.info("Ignoring my own status update");
    }
    else {
        var statName = statusContents.name;
        var status = statusContents.online;

        if ((statName != undefined) && (status != undefined) && (statName != null) && (status != null)) {

            var statColor = ((status == 0) ? "rgb(200,200,200)" : "rgb(63, 154, 247)");

            // make the notification
            if (notifyStatus) {
                const myNotification = new Notification(statName, {
                    body: statName + " is now " + ((status == 0) ? "offline" : "online"),
                });
            }

            if (usersArray.indexOf(statName) == -1) {
                usersArray.push(statName);

                let ul = document.querySelector("#onlineList");
                let li = document.createElement("li");

                li.innerHTML = `<div class="container">
                                    <b id="${'@' + statName}" class="left_side" style="cursor: pointer;" onclick="tagUser(this.id)">${statName}</b>
                                    <i id="${recNetID}" class="fas fa-wifi fa-med right_side" style="color: ${statColor};"></i>
                                </div>`;

                ul.appendChild(li);
                document.getElementsByClassName("onlineBoard").style.display = "block";
            }
            else {
                document.getElementById(recNetID).style.color = statColor;
            }
        }
    }

}

function parseNewMessage(recNetID, messageContents) {

    var timestamp = messageContents.timestamp;
    var messName = messageContents.name;
    var mess = messageContents.message;

    if (timestamp != undefined && messName != undefined && mess != undefined && isNaN(timestamp) == false && messName != null && mess != null) {
        var messTime = new Date(0);
        var day, month, year, fullDate;
        messTime.setUTCSeconds(timestamp);

        day = messTime.getDate();
        month = messTime.getMonth();
        year = messTime.getFullYear();
        fullDate = (month + 1) + "/" + day + "/" + year + " " + messTime.toLocaleTimeString();

        console.log(fullDate + " " + messName + " " + mess);

        if (recNetID == netID) {
            console.log("got my message")

            document.getElementById(netID + timestamp).style.background = "rgb(92, 160, 255)";
        }
        else {
            // make the notification
            if (notifyMessage == true) {
                const myNotification = new Notification(messName, {
                    body: mess,
                });
            }

            let ul = document.querySelector("#messagesList");
            let li = document.createElement("li");

            li.innerHTML = `<div class="container">
                                <div class="message-body-them">
                                    <b id="${'@' + messName}" class="left_side" style="cursor: pointer;" onclick="tagUser(this.id)">${messName}</b><br>
                                    <p class="left_side">${mess}</p><br>
                                    <small class="left_side">${fullDate}</small>
                                </div>
                            </div>`;

            ul.appendChild(li);
        }

        console.log("should scroll");
        items = document.querySelectorAll(".container");
        last = items[items.length - 1];
        last.scrollIntoView();
    }
}

function tagUser(value) {
    var alreadyWritten = document.getElementById("messageHolder").value;

    if (alreadyWritten.slice(-1) == ' ' || alreadyWritten.length == 0) {
        space = '';
    }
    else {
        space = ' ';
    }

    document.getElementById("messageHolder").value = alreadyWritten + space + value + ' ';
    document.getElementById("messageHolder").focus();
}