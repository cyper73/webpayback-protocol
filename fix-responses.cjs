const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('server/security/*.ts');
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const regex = /return\s+res\.status\(([^)]+)\)\.json\(([\s\S]*?)\);/g;
  content = content.replace(regex, (match, p1, p2) => {
    return `res.status(${p1}).json(${p2});\n    return;`;
  });
  fs.writeFileSync(file, content);
}
console.log('done');
