# Setting up a node environment

curl -L https://raw.githubusercontent.com/tj/n/master/bin/n -o n
sudo bash n lts
sudo npm i -g npm
# this updates npm
# test if npm is still there)
npm -v
# if not, install again with `sudo bash n lts`
sudo npm i -g yarn pm2 n

# Setting up the bot

mkdir bots
cd bots
git clone https://github.com/dredshep/MemeUnityFAQBot.git
cd MemeUnityFAQBot
yarn
pm2 start . --name faqbot

# Restarting the bot to apply changes

git pull
pm2 restart faqbot --update-env