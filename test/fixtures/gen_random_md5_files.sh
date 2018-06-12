#!/bin/bash

echo "Warning, this script creates a lot of test file data"
echo "  This script is used to create files for load testing scratch-assets"
echo "  The wrk test runs by loading all these test files into memory and then"
echo "  uploading them to staging"
echo "  You may want to run rm tmp/*.dat after running this!"

if [ `which md5` ]; then
    MD5="md5 -q"
else
    MD5="md5sum"
fi

mkdir -p tmp

function make_some_data () {
  echo "Generating $1 file(s) with [$(($2*))$2,$3] x $4 block sizes: "
  for i in `seq 1 $1`
  do
    SEED=$(od -vAn -N4 -tu4 < /dev/urandom | head -1 | awk '{$1=$1;print}')
    BLOCKS=`awk -v min=$2 -v max=$3 -v seed=$SEED 'BEGIN{srand(seed); print int(min+rand()*(max-min))}'`
    dd if=/dev/urandom of=tmp/data bs=$4 count=$BLOCKS >& /dev/null
    HASH=$($MD5 tmp/data | awk '{print $1}')
    mv tmp/data tmp/${HASH}.dat
    printf "#%.0s" {1..$i}
  done
  printf "\n"
}

# Some large 25 x 3.5-10MB
make_some_data 25 7 19 512k

# More mediums, 75 x 50-1250KB
make_some_data 75 1 25 50k

# Even more small, 200 x 1-40KB
make_some_data 200 1 40 1k
