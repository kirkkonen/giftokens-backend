import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import dotenv  from "dotenv"
dotenv.config()

const apiKey = process.env.MAILGUN_API_KEY
const domain = process.env.MAILGUN_DOMAIN

console.log('domain mail', domain)

const text = `
Hi!

You have just created a new crypto wallet and claimed some free tokens in seconds. Impressive start!
Stay tuned for new opportunities from Giftokens.

Cheers,
Giftokens team
`

const mailgun = new Mailgun(FormData);


const mailgunClient = mailgun.client({
    url: 'https://api.eu.mailgun.net',
    username: 'api',
    key: apiKey
})

export async function sendMailgunEmail2(to) {
    return mailgunClient.messages.create(domain,{
        to,
        text,
        from: 'hi@giftokens.xyz',
        subject: 'Welcome to Giftokens!',
    });
}
