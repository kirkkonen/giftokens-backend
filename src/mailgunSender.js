import dotenv  from "dotenv"
dotenv.config()
const DOMAIN = process.env.MAILGUN_DOMAIN
const api_key = process.env.MAILGUN_API_KEY
import mg from 'mailgun-js'

const mailgun = mg({apiKey: api_key, domain: DOMAIN});

export async function sendMailgunEmail2(to) {
    const data = {
        to,
        subject: 'Welcome to Giftokens!',
        from: 'hi@giftokens.xyz',
        text: `
Hi!

You have just created a new crypto wallet and claimed some free tokens in seconds. Impressive start!
Stay tuned for new opportunities from Giftokens.

Cheers,
Giftokens team
`
    };80

    return mailgun.messages().send(data)
}
