# dauth-backend-example
Example of what a backend could look like to facilitate seamless authentication 


Assumptions:
- AWS Elastic beanstalk cli is installed.
- The traafik acme.json file will be be created like so:
    - This is configured in .ebextensions/ssl.config. You can find a pre-configure one in '.ebextensions-example/ssl.config'. NOTE: Make sure to rename '.ebextensions-example' to '.ebextensions' so that elasticbeanstalk recognizes it.
    -   '/var/app/current/services/traefik/acme.json'
- 

config
1.  Run eb init (or whatever the command is to configure the '.elasticbeanstalk/config.yml')
2. Configure traefik.yml in 'services/traefik/traefik.yml'
    - Can remove the log level, however its useful to have set to DEBUG level while you configure things.
    - change the email, use your own email.
    - ceServer, if you have it commented out, then traefik will use the production letsencrypt servers. Only have it commented for production. Have the caServer option for testing, if its commented out then you will hit rate limits which will significantly slow development.
    - storage, can change this to wherever the acme.json file will be. You can leave this option as is if you dont change the path of this file anywhere else.

3. Rename the folder '.ebextensions-example' to '.ebextensions'. This 'envConfig.config' file contains the settings for your eb-environment. The current contents of this file creates the acme.json file which stores the SSL certificate, it also opens port 443 and 8080 - in addition to the default 22 and 80.
    - Example: If you want to allow ports on your ec2, use the sslSecurityGroupIngress config. You can change the 'FromPort' and 'ToPort' numbers to allow a certain port.
    - Example: files, allows you to create files with specific contents and ownership. 

## CF Acme Cache
<b>Optional | Recommend for AWS spot instances</b>
Here am using this to carry across the SSL certificates to spot instances as they get replaced with Elastic Beanstalk.
Repo: [GitHub](https://github.com/JamesWRC/cfAcmeKVCache) | Docker Image: [Docker-Registry](https://hub.docker.com/r/jameswrc/cfacmekvcache) <br>
1.  Set up Cloudflare API access.
    - Create a scoped token in your account with the following scopes:
        - Account > Workers KV Storage > Edit
    NOTE: This API Token will give cfacmecache access to read and write ALL Cloudflare KV storage items.
2.  Environment variables:<br>


| Envname       | Description   | Required | example |
| ------ |:--------------------| :------: | :------ |
| CFA_CACHE_CF_API_KEY      | The API token used to access the KV. | ✓       | xxxxxxxxxxxxx |
| CFA_CACHE_ACCOUNT_ID      | The ID of your Cloudflare Account.      | ✓       |xxxxxxxxxxxxx |
| CFA_CACHE_KV_NAMESPACE | The namespace of the KV.      | ✓       |microservice_acme_cert_cache |
| CFA_CACHE_ACME_FILEPATH | The filepath to where the acme.js file will be stored. This file needs to be in a volume that Traefik is set to access.      | ✓       |/etc/traefik/acme.json |
| CFA_CACHE_KV_NAME | The name of the KV. Normally this is the name of the microservice or subdomain that will be used to access this server.      | ✓       |api1 |
| CFA_CACHE_ACME_ENCRYPTION_KEY | The key / secret used to encrypt and decrypt the acme.json file. If you dont specify one or dont provide this environment variable NO encryption will be used. acme.json will be stored in plain text which is DANGEROUS!      | x       |mySecretKey |
