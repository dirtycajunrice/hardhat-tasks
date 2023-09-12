#!/usr/bin/env bash

set -xeuo pipefail

rm -rf dist

mkdir dist

git stash >> /dev/null
npm version minor
git stash pop >> /dev/null

tsc
cp package.json README.md LICENSE dist/

jq 'del(.devDependencies, .scripts)' < package.json > dist/package.json

cd dist/

npm publish --access public