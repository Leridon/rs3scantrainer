#/bin/bash

mkdir dist
npm install
npm run build



rm -r ./staging/live/*
cp -r dist/* staging/live/

touch staging/live/.nojekyll

