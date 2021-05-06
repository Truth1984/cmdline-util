const u = require("awadau");
const { spawnSync } = require("child_process");
const readline = require("readline");
const { Writable } = require("stream");

let cu = {};

/**
 * simple cmd
 * @param {*} scripts
 */
cu.cmds = (scripts) => {
  let cmdarray = scripts.split(" ");
  return spawnSync(cmdarray.shift(), cmdarray, {
    shell: true,
    stdio: "pipe",
    encoding: "utf-8",
    env: process.env,
  }).stdout;
};

/**
 *
 * @param {string} question
 * @param {boolean} privateAnswer mask answer
 */
cu.cmdsq = (question, privateAnswer = false) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: new Writable({
      write: (chunk, encoding, callback) => {
        if (!privateAnswer) process.stdout.write(chunk, encoding);
        callback();
      },
    }),
    terminal: true,
  });

  return new Promise((resolve) => {
    rl.question(question + "\n", (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

/**
 * @param {*} str using eval, dangerous
 * @returns
 */
cu.parseJson = (str) => {
  return u.stringToJson(eval("(" + str + ")"));
};

/**
 *
 * @param {string} msg
 * @param {string} location optional info for error location
 * @param {number} exitCode 0-255
 * @param {boolean} exit emit exit code and end process
 */
cu.cmderr = (msg, location, exitCode = 1, exit = true) => {
  console.log("Error:", `<${location}>`, msg);
  if (exit) process.exit(exitCode);
};

/**
 *
 * @param {string} str can be $user@$addr:$port or $addr
 * i.e. root@192.168.1.1:22
 */
cu.sshGrep = (str) => {
  let user = "root";
  let addr = "";
  let port = 22;
  if (u.contains(str, ["@", ":"])) {
    user = u.refind(str, u.regexBetweenOut("^", "@"));
    addr = u.refind(str, u.regexBetweenOut("@", ":"));
    port = u.refind(str, u.regexBetweenOut(":", "$"));
  } else if (u.contains(str, "@")) {
    user = u.refind(str, u.regexBetweenOut("^", "@"));
    addr = u.refind(str, u.regexBetweenOut("@", "$"));
  } else if (u.contains(str, ":")) {
    addr = u.refind(str, u.regexBetweenOut("^", ":"));
    port = u.refind(str, u.regexBetweenOut(":", "$"));
  } else {
    addr = str;
  }
  return { user, addr, port };
};

cu.multiSelect = async (listsOrStr, index = 0, logList = true) => {
  let l = listsOrStr;
  if (u.typeCheck(l, "str")) return l;
  if (u.len(l) == 0) return l;
  if (logList) console.log(u.arrayToMap(Array.from(l.keys()), Array.from(l.values())));
  return cu.cmdsq(`Multiple sources found, using [${index}] {${l[index]}} ? (y / INDEX / n)`).then((ans) => {
    if (ans == "" || ans == "y" || ans == "Y") {
      if (l[index] == undefined) {
        console.error("Error: Exit due to key is undefined");
        process.exit(1);
      }
      return l[index];
    }
    if (!Number.isNaN(u.int(ans))) return cu.multiSelect(l, u.int(ans), false);
    process.exit(1);
  });
};

cu.shellParse = async (output, separator = " ", skipLines = 0) => {
  let lines = output.split("\n");
  lines.splice(0, skipLines);

  let headers = lines.shift();
  let splitHeader = headers.split(separator);

  let limits = [];

  for (let i = 0; i < splitHeader.length; i++) {
    let colName = splitHeader[i].trim();

    if (colName !== "") {
      limits.push({ label: colName, start: headers.indexOf(colName) });
    }
  }

  let table = lines.map((line) => {
    if (line) {
      let result = {};

      for (let key in limits) {
        let header = limits[key];
        let nextKey = parseInt(key, 10) + 1;
        let start = key === "0" ? 0 : header.start;
        let end = limits[nextKey] ? limits[nextKey].start - start : undefined;

        result[header.label] = line.substr(start, end).trim();
      }

      return result;
    }
  });

  table[table.length - 1] === undefined && table.pop();

  return table;
};

module.exports = cu;
