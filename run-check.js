const { exec } = require("child_process");
const fs = require("fs");

exec("npx.cmd tsc --noEmit", (error, stdout, stderr) => {
  fs.writeFileSync("tsc_output.txt", stdout + "\n" + stderr);
  console.log("done");
  process.exit(0);
});
