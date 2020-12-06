/*************************************************/
/************* Butt ton of variables *************/
/*************************************************/

let host = null;
let port = null;
let clientID = null;
let name = null;

// The MQTT client object
let client = null;

// Navbar buttons
const sideBtn = document.getElementById("sideBtn");
const disconnectBtn = document.getElementById("disconnectBtn");
const connectBtn = document.getElementById("connectBtn");
const settingsBtn = document.getElementById("settingsBtn");

// Modal buttons
const modalConnectBtn = document.getElementById("modalConnectBtn");
const modalCloseBtn = document.getElementById("modalCloseBtn");

// Message field buttons
const sendBtn = document.getElementById("sendBtn");

/*************************************************/
/************** The click listeners **************/
/*************************************************/

// Navbar buttons
sideBtn.addEventListener("click", goSideMenu);
disconnectBtn.addEventListener("click", manualDisconnect);
connectBtn.addEventListener("click", goConnect);
settingsBtn.addEventListener("click", goSettings);

// // Modal buttons
modalConnectBtn.addEventListener("click", onConnect);
modalCloseBtn.addEventListener("click", modalClose);

// // Message field buttons
sendBtn.addEventListener("click", parseMessage);

/*************************************************/
/*************** Onclick functions ***************/
/*************************************************/

function goSideMenu() {
  alert("Still under construction");
}

function manualDisconnect() {
  var input = confirm("Would you like to disconnect?");

  if (input == true) {
    onDisconnect();
  }
}

function goConnect() {
  var modal = document.getElementById("myModal");
  modal.style.display = "block";
}

function goSettings() {
  if (client != null && client.connected) {
    var leave = confirm("You will be disconnected from chat.\nContinue?");
    if (leave == true) {
      window.location = "pages/settings.html";
    }
  } else {
    window.location = "pages/settings.html";
  }
}

function modalClose() {
  var modal = document.getElementById("myModal");
  modal.style.display = "none";

  document.getElementById("messageHolder").focus();
}

function parseMessage() {
  const message = document.getElementById("messageHolder").value;

  const topic = clientID + "/message";
  const epochTime = Math.round(Date.now() / 1000);
  const payload =
    '{"timestamp": ' +
    epochTime +
    ', "name": "' +
    name +
    '", "message": "' +
    message +
    '"}';

  onSend(topic, payload, false);

  document.getElementById("messageHolder").value = "";
  document.getElementById("messageHolder").focus();
}

function broadcastOnline() {
  const topic = clientID + "/status";
  const payload = '{"name": "' + name + '", "online": 1}';
  onSend(topic, payload, true);
}

function broadcastOffline() {
  const topic = clientID + "/status";
  const payload = '{"name": "' + name + '", "online": 0}';
  onSend(topic, payload, true);
}

function parseResponse(topic, payload) {
  var len = clientID.length;
  const sender = topic.substring(0, len);
  var incoming;

  try {
    incoming = JSON.parse(payload);

    var type = topic.substring(topic.length - 6, topic.length);

    if (type === "status") {
      // this is a status message

      var netID = topic.substring(0, topic.length - 7);
      console.log(netID);
      var usersArray = [];

      if (usersArray.indexOf(netID) == -1) {
        usersArray.push(netID);

        let ul = document.querySelector("#onlineList");
        let li = document.createElement("li");
        li.innerHTML = `<div class="container">
        <div class="message-body-status">
          <b class="left_side">${incoming.name}</b>
          <b id="${netID}" class= "right_side">${incoming.online}</b><br>
        </div>
      </div>`;
        ul.appendChild(li);
        document.querySelector(".messageBoard").style.display = "block";
      } else {
        document.querySelector(".messageBoard").innerHTML = incoming.online;
      }
    } else {
      if (sender === clientID) {
        // this is a chat message
        // post my bubble on the right side of the screen

        let ul = document.querySelector("#messagesList");
        let li = document.createElement("li");
        li.innerHTML = `<div class="container">
        <div class="message-body-me">
          <strong class="right_side">${incoming.name}</strong><br>
          <p class="right_side">${incoming.message}</p><br>
          <small class="right_side">Delivered</small>
        </div>
      </div>`;
        ul.appendChild(li);
        document.querySelector(".messageBoard").style.display = "block";

        var objDiv = document.getElementById("messageBoard");
        objDiv.scrollTop = objDiv.scrollHeight;
      } else {
        // this is a chat message
        // post my bubble on the right side of the screen
        const myNotification = new Notification(incoming.name, {
          body: incoming.message,
        });

        let ul = document.querySelector("#messagesList");
        let li = document.createElement("li");
        li.innerHTML = `<div class="container">
        <div class="message-body-them">
          <strong class="left_side">${incoming.name}</strong><br>
          <p>${incoming.message}</p>
        </div>
      </div>`;
        ul.appendChild(li);
        document.querySelector(".messageBoard").style.display = "block";
      }
    }
  } catch (e) {
    // console.error(e); // error in the above string (in this case, yes)!
  }
}
/*************************************************/
/***************** MQTT functions ****************/
/*************************************************/

const options = {
  keepalive: 30,
  protocolId: "MQTT",
  protocolVersion: 4,
  clean: true,
  reconnectPeriod: 1000,
  connectTimeout: 30 * 1000,
  will: {
    topic: clientID + "/status",
    payload: '{"name": "' + name + '", "online": 0}',
    qos: 1,
    retain: true,
  },
  rejectUnauthorized: false,
};

function onConnect() {
  if (client == null || client.connected == false) {
    // get all connection info
    host = document.getElementById("hostVal").value;
    port = document.getElementById("portVal").value;
    cID = document.getElementById("clientIdVal").value;
    name = document.getElementById("nameVal").value;

    // construct the connection URL and make the unique clientID
    const connectUrl = "mqtt://" + host + ":" + port;
    var randAppendage = Math.random().toString(16).substr(2, 4);
    clientID = cID + "_" + randAppendage;
    if (name == "") {
      name = clientID;
    }
    options.clientId = clientID;

    // go ahead and connect
    client = mqtt.connect(connectUrl, options);

    client.on("error", (err) => {
      console.error("Connection error: ", err);
      broadcastOffline();
      client.end();

      checkConnStatus();
    });

    client.on("reconnect", () => {
      console.log("Reconnecting...");

      checkConnStatus();
    });

    client.on("connect", () => {
      console.log("Client connected:" + options.clientId);

      checkConnStatus();

      onSub("+/status");
      onSub("+/message");

      broadcastOnline();
    });

    client.on("message", (topic, message) => {
      // console.log(topic + ": " + message);

      parseResponse(topic, message);
    });
  } else {
    alert("You are already connected!");
  }
}

function onDisconnect() {
  if (client.connected == true) {
    broadcastOffline();
    client.end();
    client.on("close", () => {
      checkConnStatus();
    });
  }
}

function onSub(topic) {
  if (client.connected) {
    client.subscribe(topic, { qos: 1 }, (error, res) => {
      if (error) {
        console.error("Subscribe error: ", error);
      } else {
        console.log("Subscribed: ", res);
      }
    });
  }
}

function onSend(topic, payload, statusOrNaw) {
  if (client.connected) {
    client.publish(
      topic,
      payload,
      {
        qos: 1,
        retain: statusOrNaw,
      },
      (error) => {
        if (error) {
          console.error("Publish error: ", error);
        } else {
          if (statusOrNaw) {
            console.log("STATUS UPDATED!!");
          } else {
            console.log("MESSAGE DELIVERED!!");
          }
        }
      }
    );
  }
}

///////////////////////////////////////////////////////////////////////////

function autofilltitle() {
  var clientID = document.getElementById("clientIdVal");
  var chatName = document.getElementById("nameVal");
  chatName.value = clientID.value;
}

function checkConnStatus() {
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

window.addEventListener("load", function () {
  checkConnStatus();
});
