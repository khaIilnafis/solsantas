#!/bin/bash
cp ~/.env.development ~/solsantas/packages/solsantas/.env
cd ~/solsantas/packages/solsantas

git pull origin dev
export PATH=~/.npm-global/bin:$PATH
npm install
npm run build

cp -r build/* /var/www/dev.solsantas.xyz/html/