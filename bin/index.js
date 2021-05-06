#!/usr/bin/env node
const cu = require("../index");
const u = require("awadau");

console.log("hi");

let p = async () => {
  await cu.cmdsq("your phone?").then((ans) => console.log("phone", ans));

  await cu.cmdsq("your pw?", true).then((ans) => console.log("pw", ans));
};

// p();

cu.multiSelect(["l2", "w4", "h7"]).then((v) => console.log("result", v));
