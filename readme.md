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

using `yamljs` npm package

#### iniParser + iniWriter

using `ini` npm package

#### shellParser (output, option = {}) => [{}]

output: cmdline output

option: `{{separator:RegExp, skipHead:0, skipTail:0, selfProvideHeader?:[], lineSpliter:"\n" }}`

i.e. `cu.shellParser(cu.cmds("top -bn1 | head -n 15"), { skipHead: 6, skipTail: 0 })`

notice: this is the top command for `centos`, `windows` does not have top and `mac`'s top is different from centos, so you may want to change skipHead variable
