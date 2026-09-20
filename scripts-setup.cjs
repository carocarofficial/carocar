const {execSync}=require('child_process');
for(const cmd of ['npx prisma generate','npx prisma migrate dev --name init','npm run db:seed']){console.log(`\n> ${cmd}`);execSync(cmd,{stdio:'inherit',shell:true});}
console.log('\ncarOcar local setup complete. Run: npm run dev');
