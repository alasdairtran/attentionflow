# vevoviz

An interactive visualisation exploring how YouTube music videos drive attention to each other.

## Services

| Service       | Production                       | Development                 |
| ------------- | -------------------------------- | --------------------------- |
| Frontend App  | http://130.56.248.102:3001       | http://localhost:3001       |
| Neo4j Browser | http://130.56.248.102:7474/      | http://localhost:7474       |
| Django server | http://130.56.248.102:8001/admin | http://localhost:8001/admin |

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

# Start the local database and server, start docker-compose
cd $HOME/projects/vevoviz && docker-compose up
```

and access the frontend at [http://localhost:3001/](http://localhost:3001/)

Before making a commit, ensure that you format the code properly:

```sh
# Format Python code
isort **/*.py && autoflake --remove-all-unused-imports --ignore-init-module-imports -i -r . && autopep8 -i **/*.py

# Format JavaScript code
cd $HOME/projects/vevoviz/frontend && yarn pretty
```

## Maintenance

To back up the Neo4j database in the server:

```sh
# Shut down database
sudo docker-compose stop neo4j

# Back up
sudo docker run \
--name neo4j-dump \
--mount type=bind,source=/vevoviz/neo4j/data,target=/data \
neo4j:3.5.12 bin/neo4j-admin dump --database=graph.db --to=/data/backups/graph.db.dump

# Restart database
sudo docker-compose start neo4j
```

To restore the Neo4j database on our local machine:

```sh
# Download the backup
rsync -rlptzhe ssh --info=progress2 <username>@130.56.248.102:/vevoviz/neo4j/data/backups neo4j/data/

# Shut down neo4j
docker-compose stop neo4j

# Restore
docker run \
--name neo4j-restore \
--mount type=bind,source=$HOME/projects/vevoviz/neo4j/data,target=/data \
neo4j:3.5.12 bin/neo4j-admin load --database=graph.db --from=/data/backups/graph.db.dump --force

# Start the database again
docker-compose start neo4j
```
