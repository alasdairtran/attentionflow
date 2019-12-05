# Setting Up

```sh
# Install essential packages on Centos
sudo yum install -y tmux zsh util-linux-user gcc-c++ make nodejs nginx ufw rsync
sudo systemctl enable nginx
sudo systemctl start nginx

# Install yarn
curl --silent --location https://dl.yarnpkg.com/rpm/yarn.repo | sudo tee /etc/yum.repos.d/yarn.repo
sudo rpm --import https://dl.yarnpkg.com/rpm/pubkey.gpg
sudo yum install -y yarn

# Install docker and docker-compose
sudo yum install -y yum-utils device-mapper-persistent-data lvm2
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io
sudo systemctl enable docker
sudo systemctl start docker
sudo curl -L "https://github.com/docker/compose/releases/download/1.23.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

# Set up firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow from 130.56.0.0/16 proto tcp comment 'ANU'
sudo ufw enable
sudo ufw status verbose

# Set up django backend
django-admin startproject backend
cd backend && python manage.py startapp vevo
sudo docker-compose run backend python manage.py migrate --noinput

# Create superuser
sudo docker-compose run backend python manage.py createsuperuser

# Set up React frontend
yarn create react-app frontend

# Start the app
docker-compose up
```
