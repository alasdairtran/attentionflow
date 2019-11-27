# vevoviz

An interactive visualisation exploring how YouTube music videos drive attention to each other.

## Production

| Service       | URL                              |
| ------------- | -------------------------------- |
| Frontend App  | http://130.56.248.102:3001       |
| Neo4j Browser | http://130.56.248.102:7474/      |
| Django server | http://130.56.248.102:8001/admin |

## Local Development

To start the local database and server, start docker-compose

```sh
docker-compose up
```

and access the frontend at [http://localhost:3001/](http://localhost:3001/)

Before making a commit, ensure that you format the code properly

```sh
# Format Python code
isort **/*.py && autoflake --remove-all-unused-imports --ignore-init-module-imports -i -r . && autopep8 -i **/*.py

# Format JavaScript code
cd frontend && yarn pretty
```
