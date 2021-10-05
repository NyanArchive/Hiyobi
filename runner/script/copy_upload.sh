#!/bin/bash

rsync -rtv --update -e 'ssh -p 4869' /tmp/htemp/data/${1} root@${2}:/data/hiyobi/data
rsync -rtv --update -e 'ssh -p 4869' /tmp/htemp/data_r/${1} root@${2}:/data/hiyobi/data_r
rsync -rtv --update -e 'ssh -p 4869' /tmp/htemp/json/${1}* root@${2}:/data/hiyobi/json/
rsync -rtv --update -e 'ssh -p 4869' /tmp/htemp/tn/${1}.jpg root@${2}:/data/hiyobi/tn/

exit 0