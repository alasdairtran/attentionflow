# Setting Up

We only need to run the commands below once as admin when we first set up
the virtual machine.

```sh
# Install essential packages on Centos
sudo yum install -y git tmux zsh util-linux-user gcc-c++ make nodejs nginx \
    ufw rsync vim certbot python3-certbot-nginx autossh htop
sudo systemctl enable nginx
sudo systemctl start nginx

# Install yarn
curl --silent --location https://dl.yarnpkg.com/rpm/yarn.repo | sudo tee /etc/yum.repos.d/yarn.repo
sudo rpm --import https://dl.yarnpkg.com/rpm/pubkey.gpg
sudo yum install -y yarn

# Install docker and docker-compose
sudo yum install -y yum-utils device-mapper-persistent-data lvm2
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y --nobest docker-ce docker-ce-cli containerd.io
sudo systemctl enable docker
sudo systemctl start docker
sudo curl -L "https://github.com/docker/compose/releases/download/1.23.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

# Move Docker cache to external drive (which has more storage)
sudo service docker stop
sudo mkdir /mnt/cache
sudo mv /var/lib/docker /mnt/cache/docker
sudo ln -s /mnt/cache/docker /var/lib/docker
sudo service docker start

sudo yum install gcc openssl-devel readline-devel zlib-devel
wget https://cache.ruby-lang.org/pub/ruby/2.7/ruby-2.7.1.tar.gz
tar -xzf ruby-2.7.1.tar.gz
cd ruby-2.7.1 && ./configure && make && sudo make install
cd .. && rm -rf ruby-2.7.1 ruby-2.7.1.tar.gz
sudo /usr/local/bin/gem install tmuxinator
cd ~ && git clone https://github.com/gpakosz/.tmux.git
ln -s -f .tmux/.tmux.conf
cp .tmux/.tmux.conf.local .
git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm
# Restore ~/.tmux.conf.local, ~/.tmux/yank.sh, and tmuxinator template from backup
chmod +x ~/.tmux/yank.sh

# Set up firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow from 130.56.0.0/16 proto tcp comment 'ANU'
sudo ufw allow from 150.203.0.0/16 proto tcp comment 'ANU Secure in CECS'
sudo ufw enable
sudo ufw status verbose

# Get up-to-date Cloudflare IPs from https://www.cloudflare.com/ips/
sudo ufw allow from 173.245.48.0/20 to any port https comment 'Cloudflare'
sudo ufw allow from 103.21.244.0/22 to any port https comment 'Cloudflare'
sudo ufw allow from 103.22.200.0/22 to any port https comment 'Cloudflare'
sudo ufw allow from 103.31.4.0/22 to any port https comment 'Cloudflare'
sudo ufw allow from 141.101.64.0/18 to any port https comment 'Cloudflare'
sudo ufw allow from 108.162.192.0/18 to any port https comment 'Cloudflare'
sudo ufw allow from 190.93.240.0/20 to any port https comment 'Cloudflare'
sudo ufw allow from 188.114.96.0/20 to any port https comment 'Cloudflare'
sudo ufw allow from 197.234.240.0/22 to any port https comment 'Cloudflare'
sudo ufw allow from 198.41.128.0/17 to any port https comment 'Cloudflare'
sudo ufw allow from 162.158.0.0/15 to any port https comment 'Cloudflare'
sudo ufw allow from 104.16.0.0/12 to any port https comment 'Cloudflare'
sudo ufw allow from 172.64.0.0/13 to any port https comment 'Cloudflare'
sudo ufw allow from 131.0.72.0/22 to any port https comment 'Cloudflare'

# Create an SSH key so we can communicate with GitHub without passwords
sudo ssh-keygen -t rsa -b 4096 -C "alasdair.tran@anu.edu.au" -f /root/.ssh/vevoviz_rsa
echo "Host *
    AddKeysToAgent yes
    IdentityFile /root/.ssh/vevoviz_rsa" | sudo tee /root/.ssh/config
sudo chmod 700 /root/.ssh
sudo chmod 600 /root/.ssh/config
sudo chmod 644 /root/.ssh/vevoviz_rsa.pub
sudo chmod 600 /root/.ssh/vevoviz_rsa
# Add your public key to https://github.com/settings/keys
sudo cat /root/.ssh/vevoviz_rsa.pub

# Clone the repo
sudo git clone git@github.com:alasdairtran/vevoviz.git /mnt/prod/vevoviz
cd /mnt/prod/vevoviz

# Either restore the databases and secrets from backup, or set the app up from
# scratch as follows:
django-admin startproject backend
cd backend && python manage.py startapp vevo
sudo docker-compose run backend python manage.py migrate --noinput
sudo docker-compose run backend python manage.py createsuperuser
yarn create react-app frontend

# Start the app
sudo docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Temporarily set SSL/TLS encryption in Cloudflare to Flexible to allow HTTP
sudo ufw allow 80,443/tcp
sudo certbot certonly --nginx \
    -d attentionflow.ml \
    -d neo4j.attentionflow.ml \
    -d django.attentionflow.ml \
    -d www.attentionflow.ml \
    -d dev.attentionflow.ml \
    -d neo4jdev.attentionflow.ml \
    -d djangodev.attentionflow.ml

# Restore nginx configs
sudo adduser --system --no-create-home --shell /bin/false www-data
sudo cp nginx/nginx.conf /etc/nginx/nginx.conf
sudo cp nginx/attentionflow.conf /etc/nginx/conf.d/attentionflow.conf
sudo rm -rfv /etc/nginx/sites-enabled/default
# Verify the syntax of our configuration edits.
sudo nginx -t
# Reload Nginx to load the new configuration.
sudo systemctl restart nginx

# Add neo4j plugin to make loading csv easier
cd neo4j/plugins
sudo wget https://github.com/neo4j-contrib/neo4j-apoc-procedures/releases/download/4.1.0.2/apoc-4.1.0.2-all.jar

# We need an SSH key to access the forecaster on dijkstra
ssh-keygen -t rsa -b 4096 -C "alasdair.tran@anu.edu.au" -f secrets/.ssh/vevoviz_docker_rsa
```

## Maintenance

```sh
# Change password
sudo passwd alasdair

# Give users sudo access
echo "rong  ALL=(ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/rong
echo "georgie  ALL=(ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/georgie
echo "minjeong  ALL=(ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/minjeong
```
