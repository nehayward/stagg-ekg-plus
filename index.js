const spawn = require("child_process").spawn;

const trigger = (triggerCommand, address) => {
  const command = {
    turnOn: "efdd0a0000010100",
    turnOff: "efdd0a0100000100"
  };

  return new Promise((resolve, reject) => {
    if (!command[triggerCommand]) {
      reject("no such command [" + triggerCommand + "]");
      return;
    }

    const gatttool = spawn("gatttool", ["-b", address, "-t", "random", "-I"]);
    var connectSended = false;

    gatttool.stdout.on("data", data => {
      if (!connectSended && !data.toString().startsWith("connect")) {
        gatttool.stdin.write("connect\n");
        connectSended = true;
      } else if (data.indexOf("Connection successful") >= 0) {
        gatttool.stdin.write("char-write-req 0x000e 0100\r");
        gatttool.stdin.write(
          "char-write-cmd 0x000d efdd0b3031323334353637383930313233349a6d\r"
        );
        gatttool.stdin.write(
          "char-write-cmd 0x000d " + command[triggerCommand] + "\r"
        );
        setTimeout(() => {
          gatttool.kill();
          resolve();
        }, 1000);
      } else if (data.indexOf("Error") >= 0) {
        gatttool.kill();
        reject();
      }
    });
    gatttool.stderr.on("data", data => {
      gatttool.kill();
      reject();
    });
  });
};
module.exports = address => {
  return {
    turnOn: () => {
      return trigger("turnOn", address);
    },
    turnOff: () => {
      return trigger("turnOff", address);
    }
  };
};
