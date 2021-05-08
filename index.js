const u = require("awadau");
const { spawnSync } = require("child_process");
const readline = require("readline");
const { Writable } = require("stream");
const iniParser = require("ini");
const yamlParser = require("yamljs");

let cu = {};

/**
 * simple cmd
 * @param {string} scripts
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
 * @param {string} scripts
 * @param {boolean} simple true: return stdout; false: return full info, including status code
 *
 * example: cmdfull("exit 1",false).catch(e=>e.status) // 1
 *
 */
cu.cmdfull = async (scripts, simple = true) => {
  let cmdarray = scripts.split(" ");
  let result = spawnSync(cmdarray.shift(), cmdarray, {
    shell: true,
    stdio: "pipe",
    encoding: "utf-8",
    env: process.env,
  });
  if (result.status == 0) return simple ? result.stdout : result;
  return Promise.reject(simple ? result.stdout : result);
};

/**
 *
 * @param {string} question
 * @param {boolean} privateAnswer mask answer
 */
cu.cmdsq = (question, privateAnswer = false) => {
  let muted = false;
  const rl = readline.createInterface({
    input: process.stdin,
    output: new Writable({
      write: (chunk, encoding, callback) => {
        if (!muted) process.stdout.write(chunk, encoding);
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
    muted = privateAnswer;
  });
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

/**
 * @param {string} string using eval, dangerous
 * @returns
 */
cu.jsonParser = (string) => {
  return u.stringToJson(eval("(" + string + ")"));
};

cu.yamlParser = yamlParser.parse;

cu.yamlWriter = yamlParser.stringify;

cu.iniParser = iniParser.parse;

cu.iniWriter = iniParser.encode;

/**
 *
 * @param {string} output command output
 * @param {{separator:RegExp, skipHead:0, skipTail:0, selfProvideHeader?:[], lineSpliter:"\n", REST:false }} option
 * separator set to /\s+/
 *
 * skip auto header parsing if `selfProvideHeader` Present (can also manually add `$REST$` to the Header)
 *
 * if REST is true, add `$REST$` to the end of array for parsing uncatched segments, $REST$ = '' if there were no remaining
 *
 * example `ps -u` -> [...{...COMMAND:"node", "$REST$":"index.js --experimental-worker"}]
 */
cu.shellParser = (output, option = {}) => {
  let defaultOption = { separator: /\s+/, skipHead: 0, skipTail: 0, lineSpliter: "\n", REST: false };
  option = u.mapMergeDeep(defaultOption, option);

  let { separator, skipHead, skipTail, selfProvideHeader, lineSpliter } = option;

  let lines = output.split(lineSpliter);
  lines.splice(0, skipHead);
  lines.splice(-skipTail - 1);

  let splitHeader = selfProvideHeader ? selfProvideHeader : lines.shift().split(separator);
  splitHeader = u.arrayAdd(splitHeader, option.REST ? "$REST$" : []);

  let result = [];
  for (let i of lines) {
    if (i == "") continue;
    let lineResult = {};
    let lineSection = i.split(separator);
    let shl = splitHeader.length;
    for (let j in splitHeader) lineResult[splitHeader[j]] = lineSection[j];
    if (splitHeader[shl - 1] == "$REST$") {
      if (lineResult["$REST$"] == undefined) lineResult["$REST$"] = "";
      lineResult["$REST$"] += lineSection.slice(shl);
    }

    result.push(lineResult);
  }
  return result;
};

module.exports = cu;
