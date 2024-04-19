
# Git clone it
(docs here)[https://www.restack.io/docs/airbyte-knowledge-airbyte-self-hosted-integration]

Or 
```bash
mkdir airbyte && cd airbyte
wget https://raw.githubusercontent.com/airbytehq/airbyte/master/run-ab-platform.sh
chmod +x run-ab-platform.sh
```

# Config
1. Go to http://<serverIP>:8000/
2. Enter credentials
3. Set up each Postgres source (check .env for values)
4. Setup up each Typesense destination (check .env for values)