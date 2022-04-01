#!/usr/bin/env bash



cd /var/www/letsencrypt
python -m SimpleHTTPServer 8083 > /dev/null 2>&1 & disown
PID="$!"
echo "$PID"
> /etc/haproxy/auth/domains.lst


certbot renew

kill "$PID"


cat /etc/haproxy/auth/domains.lst
if [[ -s /etc/haproxy/auth/domains.lst ]]; then
echo "generating certificates"
	for domain in `cat /etc/haproxy/auth/domains.lst`; do
		cat /etc/letsencrypt/live/"$domain"/fullchain.pem /etc/letsencrypt/live/"$domain"/privkey.pem > /etc/haproxy/certificates/"$domain".pem
	done
	systemctl restart haproxy.service
else
	echo "no certificates due for renewal"
fi
