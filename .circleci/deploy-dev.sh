#!/bin/bash
cp ~/.env.development ~/solsantas/packages/solsantas/.env
cd ~/solsantas/packages/solsantas

git pull origin dev

npm install
npm run build
export PATH=~/.npm-global/bin:$PATH
source ~/.profile
cp -r build/* /var/www/dev.solsantas.xyz/html/