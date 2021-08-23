FROM continuumio/miniconda3:4.7.12

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1


RUN apt-get --allow-releaseinfo-change update \
    && apt-get update && apt install -yq --no-install-recommends \
    netcat \
    texlive-xetex \
    gnupg2 \
    && wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - \
    && echo "deb http://apt.postgresql.org/pub/repos/apt/ `sed 's/VERSION_CODENAME=//;t;d' /etc/os-release`-pgdg main" | tee  /etc/apt/sources.list.d/pgdg.list \
    && apt-get update \
    && apt-get install -y postgresql-client-12 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*
COPY conda.yaml /backend/
RUN conda env update -f=/backend/conda.yaml
RUN rm -rf /opt/conda/lib/python3.8/site-packages/ruamel* \
    && pip install --no-cache-dir jina

# COPY . /backend/
WORKDIR /backend
