import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import dotenv  from "dotenv"
dotenv.config()

const apiKey = process.env.MAILGUN_API_KEY
const domain = process.env.MAILGUN_DOMAIN

console.log('domain mail', domain)

// const text = `
// Hi!

// You have just created a new crypto wallet and claimed some free tokens in seconds. Impressive start!
// Stay tuned for new opportunities from Giftokens.

// Cheers,
// Giftokens team
// `

const text = `
Hi!

Welcome to Giftokens and to the world of decentralized finance!

You have just successfully staked your 100 GFTKNS with a 12.5% APR. This means that if the market conditions stay stable, in one year your stake will be worth 125 GFTKNS. Impressive!

To validate that you are a GFTKNS staker, we have minted some stGFTKNS tokens for you. You will bring us back these once you wish to unstake your GFTKNS with income. 

There are ways to boost this rate:

- Buy more GFTKNS here (https://app.uniswap.org/) and increase your stake. 1000 staked GFTKNS with 12.5% APR will become 1250 GFTKNS in one year.
- Put your stGFTKNS into a farming contract (https://pancakeswap.finance/farms) and start getting rewards right away

Cheers,
Giftokens team
`

const mailgun = new Mailgun(FormData);


const mailgunClient = mailgun.client({
    url: 'https://api.eu.mailgun.net',
    username: 'api',
    key: apiKey
})

//temporarily unavailable, need to create a separate file for this one
export async function sendMailgunEmail2(to) {
    return mailgunClient.messages.create(domain,{
        to,
        text,
        from: 'hi@giftokens.xyz',
        subject: 'Welcome to Giftokens!',
    });
}

export async function sendStakingMailgunEmail(to) {
    //console.log('to: ', to, 'text: ', text)
    return mailgunClient.messages.create(domain,{
        to,
        text,
        from: 'hi@giftokens.xyz',
        subject: 'Successful stake. What’s next?',
    });
}
