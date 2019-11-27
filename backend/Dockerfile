FROM continuumio/miniconda3:4.7.12

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1


RUN apt-get update && apt-get install -yq --no-install-recommends \
    netcat \
    texlive-xetex \
    && apt-get clean && rm -rf /var/lib/apt/lists/*
COPY conda.yaml /backend/
RUN conda env update -f=/backend/conda.yaml

COPY . /backend/
WORKDIR /backend
