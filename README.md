# vevoviz

An interactive visualisation exploring how YouTube music videos drive attention to each other.

## Services

| Service       | Production                      | Development                     | Local                       |
| ------------- | ------------------------------- | ------------------------------- | --------------------------- |
| Frontend App  | http://43.240.97.170:3001       | http://43.240.97.170:3002       | http://localhost:3002       |
| Neo4j Browser | http://43.240.97.170:7474/      | http://43.240.97.170:7475       | http://localhost:7475       |
| Django server | http://43.240.97.170:8001/admin | http://43.240.97.170:8002/admin | http://localhost:8002/admin |

## Getting Started

Instructions on how to set up the local development on your Mac machine:

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

# Start the local database and server
cd $HOME/projects/vevoviz
docker-compose up
```

and access the frontend at [http://localhost:3001/](http://localhost:3002/)

Before making a commit, ensure that you format the code properly:

```sh
# Format Python code
isort **/*.py && autoflake --remove-all-unused-imports --ignore-init-module-imports -i -r . && autopep8 -i **/*.py

# Format JavaScript code
cd $HOME/projects/vevoviz/frontend && yarn pretty
```

## Working Remotely

```sh
# Inside the CentOS virtual machine, to start the production app
cd /mnt/vevoviz_prod && sudo docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# To start the development app
cd /mnt/vevoviz_dev && sudo docker-compose up -d
```

## Maintenance

To back up the Neo4j database in the server:

```sh
cd /vevoviz

# Shut down database
sudo docker-compose stop neo4j

# Back up
sudo docker run \
--name neo4j-dump \
--mount type=bind,source=/vevoviz/neo4j/data,target=/data \
neo4j:3.5.12 bin/neo4j-admin dump --database=graph.db --to=/data/backups/graph.db.dump

# Restart database
sudo docker-compose start neo4j

# Delete the backup container
sudo docker rm neo4j-dump
```

To restore the Neo4j database on our local machine:

```sh
cd $HOME/projects/vevoviz

# Download the backup
rsync -rlptzhe ssh --info=progress2 <username>@130.56.248.102:/vevoviz/neo4j/data/backups neo4j/data/

## if you see this error: rsync: --info=progress2: unknown option
## make sure to add export /usr/bin/local:$PATH in your ~./bash_profile

# Shut down neo4j
docker-compose stop neo4j

# Restore
docker run \
--name neo4j-restore \
--mount type=bind,source=$HOME/projects/vevoviz/neo4j/data,target=/data \
neo4j:3.5.12 bin/neo4j-admin load --database=graph.db --from=/data/backups/graph.db.dump --force

# Start the database again
docker-compose start neo4j

# Delete the restore container
docker rm neo4j-restore
```
