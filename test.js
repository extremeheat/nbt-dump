const cp = require('child_process')

cp.execSync(`node index.js file.nbt`, { stdio: 'inherit' })
console.log('✔ Done')