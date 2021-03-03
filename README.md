# Installation

```bash
git clone https://github.com/dredshep/MemeUnityFAQBot.git
cd MemeUnityFAQBot
yarn
```

Make a file called `secrets.json` in the root directory. Fill it with an object such as the following: `{"token":"your token gotten from @Botfather"}`

```bash
# to test if it runs
node .
# to run with pm2
pm2 start . --name faqbot
```
