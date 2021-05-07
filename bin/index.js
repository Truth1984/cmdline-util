#!/usr/bin/env node
const cu = require("../index");
const u = require("awadau");

let p = async () => {
  await cu.cmdsq("your phone?").then((ans) => console.log("phone", ans));

  await cu.cmdsq("your pw?", true).then((ans) => console.log("pw", ans));
};

// p();

// cu.multiSelect(["l2", "w4", "h7"]).then((v) => console.log("result", v));

// let tops = cu.cmds("top -bn1 | head -n 15");
// console.log(tops);
// let sp = cu.shellParser(tops, { skipHead: 6, skipTail: 0 });
// console.log(sp, u.len(sp), sp[u.len(sp) - 1]);

let ps = cu.cmds("ps -u | head -n 15");
console.log(ps);

// let header = ["USER", "PID", "%CPU", "%MEM", "VSZ", "RSS", "TTY", "STAT", "START", "TIME", "COMMAND", "$REST$"];
// let psp = cu.shellParser(ps, { separator: /\s{1,}/, selfProvideHeader: header });

let psp = cu.shellParser(ps, { separator: /\s{1,}/, REST: true });
console.log(psp);
