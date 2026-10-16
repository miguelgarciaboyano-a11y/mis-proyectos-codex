import {readdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const files=readdirSync('src').filter(f=>f.endsWith('.js')).map(f=>'src/'+f);
for(const f of files){const r=spawnSync(process.execPath,['--check',f],{stdio:'inherit'});if(r.status!==0)process.exit(r.status||1);}
console.log(`${files.length} módulos JavaScript: sintaxis correcta.`);
