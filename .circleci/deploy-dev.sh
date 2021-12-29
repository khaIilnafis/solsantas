#!/bin/bash

cd ~/solsantas/packages/solsantas

git pull origin dev

npm install
npm run build

cp -r build/* /var/www/dev.solsantas.xyz/html/