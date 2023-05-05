#/bin/bash

rm -r ./staging/live/*
cp -r dist/* staging/live/

touch staging/live/.nojekyll

