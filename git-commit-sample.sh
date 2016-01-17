timeStamp=$(date +"%a, %D %r")

cd build

#Commit changes
git init
git remote set-url origin https://github.com/solio/GitPractice.git
git add --all
git commit -m "Automated Sync - $timeStamp"
#Push them up to the repo
git push -u origin master