#!/bin/bash
cd /var/www/letsencrypt
python -m SimpleHTTPServer 8083 > /dev/null 2>&1 & disown
PID="$!"
echo "$PID"

sudo certbot certonly --manual --preferred-challenges=http --http-01-port=8083 --manual-auth-hook /etc/haproxy/auth/authenticator.sh --manual-cleanup-hook /etc/haproxy/auth/cleanup.sh -d "$1" --manual-public-ip-logging-ok

kill "$PID"

if [[ -d /etc/letsencrypt/live/"$1" ]]; then
	cat /etc/letsencrypt/live/"$1"/fullchain.pem /etc/letsencrypt/live/"$1"/privkey.pem > /etc/haproxy/certificates/"$1".pem
	echo "Added $1.pem to haproxy"
else
	echo "Could not locate etc/letsencrypt/live/$1"
fi
systemctl restart haproxy.service
