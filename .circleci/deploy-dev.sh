#!/bin/bash
cp .env.development ~/solsantas/packages/solsantas/.env
cd ~/solsantas/packages/solsantas

git pull origin dev

node /home/circleci/.nvm/versions/node/v17.2.0/lib/node_modules/npm/ install
node /home/circleci/.nvm/versions/node/v17.2.0/lib/node_modules/npm/ run build

cp -r build/* /var/www/dev.solsantas.xyz/html/