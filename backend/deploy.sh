echo '[+]\t(1/2)\tUpdating enviroment variables for ElasticBeanstalk environment...'
eb setenv $(tr '\n' ' ' < .env)
echo '[+]\t(1/2)\t Updated.'

echo '[+]\t(2/2)\t Make sure to have commit any changes, waiting 10 seconds...'
sleep 10
echo '[+]\t(2/2)\t Deploying code to ElasticBeanstalk...'
eb deploy
echo '[+]\t(2/2)\t Deployed. Done.'


