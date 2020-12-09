let client = null;

var host = null;
var port = null;
var netID = null;
var name = null;
var cID = null;

window.addEventListener("load", function () {
    checkConnStatus();
});

const options = {
    keepalive: 30,
    clientId: cID,
    protocolId: "MQTT",
    protocolVersion: 4,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 1000,
    will: {
        topic: netID + "/status",
        payload: `{"name": "${name}", "online": 0}`,
        qos: 1,
        retain: true,
    },
    rejectUnauthorized: false,
    resubscribe: true,
};

function updateGlobals(config) {
    host = config.host;
    port = config.port;
    netID = config.netID;
    name = config.name;
    cID = config.cID;

    options.clientId = cID;
    options.will.topic = netID + "/status";
    options.will.payload = `{"name": "${name}", "online": 0}`;
}

function connect(config) {
    updateGlobals(config);

    client = mqtt.connect(config.URL, options);

    client.on("error", (err) => {
        console.log("Connection error: ", err);
        client.end();
        checkConnStatus();
    });

    client.on("reconnect", () => {
        console.log("Reconnecting...");
        checkConnStatus();
    });

    client.on("disconnect", () => {
        console.log("oops");
        checkConnStatus();
    });

    client.on("close", () => {
        console.log("done");
        checkConnStatus();
    });

    client.on("offline", () => {
        console.log("off");
        checkConnStatus();
    });

    client.on("connect", () => {
        console.log("success");
        checkConnStatus();

        subToChannel("+/status");
        subToChannel("+/message");

        publishToChannel(true, netID + "/status", `{"name": "${name}", "online": 1}`);
    });

    client.on("message", (topic, message) => {
        try {
            var payload = JSON.parse(message.toString());

            if (topic.slice(-1) == "s") {
                var recNetID = topic.substring(0, topic.length - 7);
                // console.log("status: " + recNetID);

                parseStatusUpdate(recNetID, payload);
            } else if (topic.slice(-1) == "e") {
                var recNetID = topic.substring(0, topic.length - 8);
                console.log("message: " + recNetID);

                parseNewMessage(recNetID, payload);
            }
        } catch (e) {
            // console.error(e)
        }
    });
}

function subToChannel(topic) {
    if (client.connected) {
        client.subscribe(topic, { qos: 1 }, (error) => {
            if (error) {
                console.error("Subscribe error: ", error);
                checkConnStatus();
            }
        });
    }
}

function publishToChannel(retain, topic, payload) {

    console.log("publishing: " + payload + " to: " + topic);

    client.publish(topic, payload, { qos: 1, retain: retain }, (error) => {
        if (error) {
            console.error("Publish error: ", error);
            checkConnStatus();
        }
    });

    // on success
    if (!retain) {
        document.getElementById("messageHolder").value = "";
        document.getElementById("messageHolder").focus();
    }
}