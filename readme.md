## cmdline util

#### example

```js
const cu = require("cmdline-util");

let topResult = cu.cmds("top -bn1 | head -n 15");
console.log(cu.shellParser(topResult, { skipHead: 6, skipTail: 2 }));
```

## api

#### cmds(scripts) => string

taking command line input and return command result as string

#### async cmdfull(scripts, simple = true) => string | {}

does not auto print value to terminal

if simple were true: return stdout; else return full info, including status code

reject if status > 0

example: `cmdfull("exit 1",false).catch(e=>e.status) // 1`

#### async cmdsq(question, privateAnswer = false) => string

interactive, return answer as string

privateAnswer for command line mask, mainly used by inputing password

#### cmderr(msg, location, exitCode = 1, exit = true)

msg: error message to display on cmdline, location: optional, where did the error occur,
exitCode: emit exit code, can be catched by `$?`, exit: exit the process

#### sshGrep (str) => { user, addr, port }

transform string into proper ssh info, str can be `192.168.1.1:2222` => `{user:"root", addr:"192.168.1.1", port:"2222"}`

#### async multiSelect(listsOrStr, index = 0, logList = true) => string

interactive, return answer as string

return listsOrStr directly if you were passing a string

index: current index, logList: log the list

#### jsonParser (string) => {}

dangerous, `eval` the string

string can be normal stringified json or object: i.e.

`"{\"a\":13}" || '{a:13}' `

#### yamlParser + yamlWriter

using `yaml` npm package

#### iniParser + iniWriter

using `ini` npm package

#### shellParser (output, option = {}) => [{}]

output: cmdline output

option: `{{separator:RegExp, skipHead:0, skipTail:0, selfProvideHeader?:[], lineSpliter:"\n", REST:false }}`

i.e. `cu.shellParser(cu.cmds("top -bn1 | head -n 15"), { skipHead: 6, skipTail: 0 })`

notice: this is the top command for `centos`, `windows` does not have top and `mac`'s top is different from centos, so you may want to change skipHead variable

skip auto header parsing if `selfProvideHeader` Present (can also manually add `$REST$` to the Header)

set REST to true, then it adds `$REST$` to the end of array for parsing uncatched segments, $REST$ = [] if there were no remaining

example `ps -u` -> [...{...COMMAND:"node", "$REST$":["index.js", "--experimental-worker"]}]

```js
cu.shellParser(cu.cmds("docker ps", 1), {
  skipHead: 1,
  selfProvideHeader: ["CONTAINER ID", "IMAGE", "COMMAND", "CREATED", "STATUS", "PORTS", "NAMES"],
  separator: /\s{2,80}/,
});
```
