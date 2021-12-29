#!/bin/bash

cd ~/solsantas/packages/solsantas

git pull origin main

npm install
npm run build

cp -r build/* /var/www/solsantas.xyz/html/