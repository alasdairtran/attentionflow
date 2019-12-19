# Setting Up

We only need to run the commands below once as admin when we first set up
the virtual machine.

```sh
# Install essential packages on Centos
sudo yum install -y git tmux zsh util-linux-user gcc-c++ make nodejs nginx ufw rsync
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

# Set up firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow from 130.56.0.0/16 proto tcp comment 'ANU'
sudo ufw allow from 150.203.0.0/16 proto tcp comment 'ANU Secure in CECS'
sudo ufw enable
sudo ufw status verbose

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
