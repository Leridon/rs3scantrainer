#/bin/bash

rm -r staging/live/*
cp -r dist/*

touch staging/live/.nojekyll

