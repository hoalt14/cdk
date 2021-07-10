#!/bin/bash

set -ex

s3_bucket='hoalt-codecommit-backup-bucket'

aws s3 ls --region $AWS_DEFAULT_REGION s3://$s3_bucket/ | awk '{ print $2 }' > objects

object='objects'

file=1

while read line
do
    aws s3 ls --region $AWS_DEFAULT_REGION s3://$s3_bucket/$line | awk '{ print $4 }' > "$file.txt"
    file=$((file+1))

    for f in *.txt
    do
        delete=`head -n 1 $f`

        if [ `cat $f | wc -l` -gt 3 ]
        then
            if [ `awk -F_ '{ print $1"/"; exit }' $f` == $line ]
            then
                echo "delete the old file ago three days"
                aws s3 rm s3://${s3_bucket}/${line}${delete} --region $AWS_DEFAULT_REGION
                tail -n +2 $f > tmp && mv tmp $f
                echo "Done"
            else
                echo "Next"
            fi
        fi
    done

done < $object
