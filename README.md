# vevoviz

An interactive visualisation exploring how YouTube music videos drive attention to each other.

## Service overview

| Service       | Production                      | Development                     | Local                       |
| ------------- | ------------------------------- | ------------------------------- | --------------------------- |
| Frontend App  | https://attentionflow.ml        | https://dev.attentionflow.ml    | http://localhost:3002       |
| Neo4j Browser | http://43.240.97.170:7474       | http://43.240.97.170:7475       | http://localhost:7475       |
| Django server | http://43.240.97.170:8001/admin | http://43.240.97.170:8002/admin | http://localhost:8002/admin |

## Getting Started

How to set up the local development on your Mac machine:

```sh
# Download brew
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

# Download yarn
brew install yarn

# Download Docker from https://docs.docker.com/docker-for-mac/install/

# Clone the repo
mkdir $HOME/projects && cd $HOME/projects
git clone git@github.com:alasdairtran/vevoviz.git

# Download the dependencies on the front-end
cd $HOME/projects/vevoviz/frontend && yarn

# Migrate the postgres database
cd $HOME/projects/vevoviz && docker-compose run backend python manage.py migrate --noinput

# Start the frontend app and Neo4j database
cd $HOME/projects/vevoviz
docker-compose up
```

The frontend app is available at [http://localhost:3002/](http://localhost:3002/) and Neo4j database is [http://localhost:7475/](http://localhost:7475/).
Note that the local Neo4j database needs restore the data dump from the remote server.

```sh
cd $HOME/projects/vevoviz

# Download the backup
rsync -rlptzhe ssh --info=progress2 <username>@43.240.97.170:/mnt/vevoviz_prod/neo4j/data/backups neo4j/data/

## if you see this error: "rsync: --info=progress2: unknown option"
## make sure rsync is with the latest version (>=3.1.3)

# Shut down neo4j
docker-compose stop neo4j

# Restore
docker run \
--name neo4j-restore \
--mount type=bind,source=$HOME/projects/vevoviz/neo4j/data,target=/data \
neo4j:4.1.1 bin/neo4j-admin load --database=neo4j --from=/data/backups/neo4j.dump --force

# Start the database again
docker-compose start neo4j

# Delete the restore container
docker rm neo4j-restore
```

Before making a commit, make sure that you format the code properly:

```sh
# Format Python code
isort **/*.py && autoflake --remove-all-unused-imports --ignore-init-module-imports -i -r . && autopep8 -i **/*.py

# Format JavaScript code
cd $HOME/projects/vevoviz/frontend && yarn pretty
```

## Working Remotely

```sh
# Inside the Nectar virtual machine, start the production app
cd /mnt/vevoviz_prod && sudo docker-compose -f docker-compose.prod.yml up -d

# Start the development app
cd /mnt/vevoviz_dev && sudo docker-compose up -d
```

## Backing up the Neo4j database

```sh
cd /mnt/vevoviz_prod

# Shut down database
docker-compose stop neo4j

# Back up
docker run \
--name neo4j-dump \
--mount type=bind,source=/mnt/vevoviz_prod/neo4j/data,target=/data \
neo4j:4.1.1 bin/neo4j-admin dump --database=neo4j --to=/data/backups/neo4j.dump

# Restart database
docker-compose start neo4j

# Delete the backup container
docker rm neo4j-dump
```
