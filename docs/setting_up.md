# Setting Up

```sh
# Install essential packages on Centos
sudo yum install -y tmux zsh util-linux-user gcc-c++ make nodejs

# Install yarn
curl --silent --location https://dl.yarnpkg.com/rpm/yarn.repo | sudo tee /etc/yum.repos.d/yarn.repo
sudo rpm --import https://dl.yarnpkg.com/rpm/pubkey.gpg
sudo yum install -y yarn

# Install docker
sudo yum install -y yum-utils device-mapper-persistent-data lvm2
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io
sudo systemctl start docker

# Set up django backend
django-admin startproject backend
cd backend && python manage.py startapp vevo
docker-compose run backend python manage.py migrate --noinput

# Set up React frontend
yarn create react-app frontend

# Start the app
docker-compose up
```
