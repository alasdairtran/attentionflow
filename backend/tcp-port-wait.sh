#!/bin/bash

# Taken from https://stackoverflow.com/a/42206594

set -e

cmd="${@:3}"

if [ -z "$1" -o -z "$2" ]
then
    echo "tcp-port-wait - block until specified TCP port becomes available"
    echo "Usage: ntcp-port-wait HOST PORT"
    exit 1
fi
echo Waiting for port $1:$2 to become available...
while ! nc -z $1 $2 2>/dev/null
do
    let elapsed=elapsed+1
    if [ "$elapsed" -gt 90 ]
    then
        echo "TIMED OUT !"
        exit 1
    fi
    sleep 1;
done

>&2 echo "Postgres is up - executing command"
exec $cmd
