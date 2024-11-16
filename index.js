import express from 'express'
import  { CronJob } from 'cron'
import dotenv from 'dotenv'

dotenv.config()

const app = express();
const PORT = process.env.PORT || 3000;

//Gitub configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.GITHUB_REPO;

async function doContribution(){
    const date = new Date().toISOString();
    const newContent =  `#Automated contribution \n\Last update: ${date}`;

    const url = `https://api.github.com/repos/${REPO}/contents/README.md`;
    const response = await fetch(url , {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            message: 'Automated contribution',
            content: Buffer.from(newContent).toString('base64'),
            sha: await getSha(url)
        })
    })

    if(response.ok){
        console.log('Readme updated successfully')
    }else{
        console.log('Failed to contribute:' , await response.json())
    }
}

async function getSha(url) {
    const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}` },
    });
    const data = await response.json();
    return data.sha;
}

export async function setApplicationRunning(){
    console.log('Running')
}

// Schedule the job to run daily
const everyMinuteJob = new CronJob('* * * * *', setApplicationRunning  , null, true, 'UTC');
const dailyJob = new CronJob('0 0 */6 * *',  doContribution, null, true, 'UTC');
everyMinuteJob.start();
dailyJob.start();

app.get('/', (req, res) => {
    res.send('GitHub Contribution Bot is running!');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});