#!/usr/bin/env bash
rm -rf code.zip 
 
zip ./code.zip * -r -x node_modules/aws-sdk/\* 

aws lambda update-function-code --function-name SteveLambda --zip-file fileb://./code.zip
