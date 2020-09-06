FROM debian:latest

RUN apt update && apt install -yq --no-install-recommends autossh \
    && apt clean && rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["autossh"]
