#! /bin/sh
/usr/local/bin/pm2 stop $2
NODE_ENV=$1 /usr/local/bin/pm2 start $3/app.js --name=$2 -o /dev/null

