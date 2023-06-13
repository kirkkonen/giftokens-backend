import express from 'express'
import axios from 'axios'
import cors from 'cors'
import fs from 'fs'
import { promises as fsPromises } from 'fs'
import { unlink } from 'node:fs/promises';
import writeFileSync from 'fs'
import FormData from 'form-data'
import https from 'https'
import { Configuration, OpenAIApi } from 'openai'
import fetch from 'node-fetch'
import { Network, Utils, Alchemy } from 'alchemy-sdk'
import dotenv  from "dotenv"
import Moralis from 'moralis';


dotenv.config()

const alchemySettings = {
    apiKey: process.env.ALCHEMY_GOERLI_API_KEY,
    // apiKey: process.env.ALCHEMY_SEPOLIA_API_KEY,
    network: Network.ETH_GOERLI
    // network: Network.ETH_SEPOLIA
};

const alchemy = new Alchemy(alchemySettings);
const feeData = await alchemy.core.getFeeData();


const app = express()
const port = 8080


const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);


// Save image to file
function saveToFile(link, fileName) {
  return new Promise((resolve, reject) => {

    https.get(link, function (response) {

      const newFile = fs.createWriteStream(`./${fileName}`);

      response.on("error", reject)

      newFile.on("finish", () => {
          newFile.close();
          console.log("Download Done!");
          resolve()
         }).on("error", reject)

      response.pipe(newFile)

      }).on("error", reject)
  })
}

// Pin files to IPFS

const JWT = process.env.PINATA_JWT
const pinFileToIPFS = async (link) => {

  const fileName = `image${Math.floor(Math.random() * 1000)}.png`

    await saveToFile(link, fileName)

    const formData = new FormData();
    const file = fs.createReadStream(`./${fileName}`)
    formData.append('file', file)

    const metadata = JSON.stringify({
      name: 'test-file',
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    })
    formData.append('pinataOptions', options);

    try{
      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        maxBodyLength: "Infinity",
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          Authorization: JWT
        }
      });

      try {
        await unlink(fileName);
        console.log('successfully deleted ', fileName);
      } catch (error) {
        console.error('deletion error: ', error.message);
      }
      return res.data

    } catch (error) {
      console.log(error)
    }

}

// Pin JSON to IPFS

async function pinJSON(imageHash) {

  const data = JSON.stringify({
    name: "Giftoken",
    description: "NFT with balabce",
    image:  `https://ipfs.io/ipfs/${imageHash}`
  })

  var config = {
    method: 'post',
    url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': JWT
    },
    data : data
  };

  const res = await axios(config)
  console.log('res. data from axios: ', res.data)
  return res.data
}


app.use(express.urlencoded({extended: true}));
app.use(express.json())
app.use(cors())

await Moralis.start({
  apiKey: process.env.MORALIS_API_KEY
});

// Get image from OpenAI
app.get('/api/images', async (req, res) => {


    try {
      const { prompt, n } = req.query;
      console.log('request data', prompt, parseInt(n, 10))
      const response = await openai.createImage({
          prompt: `${prompt}`,
          n: parseInt(n, 10),
          size: "256x256",
      });

      console.log(response.data.data.map((data) => data.url))
      res.send(response.data.data.map((data) => data.url))
    } catch (error) {
      console.log('error: ', error)
    }


})

// Get IPFS hash
app.get('/api/send', async (req, res) => {
    const { imageURL } = req.query
    const getterResponse = await pinFileToIPFS(imageURL)
    console.log('image hash getter response', getterResponse)

    const JSONipfs = await pinJSON(getterResponse.IpfsHash)
    console.log('JSON hash getter response', JSONipfs)

    res.send(JSONipfs)
})

// Get abi
app.get('/api/abi', async (req, res) => {

  const { address } = req.query
  console.log('address: ', address)

  // const etherscanLink = `https://api-goerli.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${etherscanApiKey}`
  const etherscanLink = `https://api-sepolia.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${etherscanApiKey}`


  const response = await axios.get(etherscanLink);
  const data = await response.data.result;
  console.log('get abi response: ', data)

  res.send(data)

})

// Get maxPriorityFeePerGas

app.get('/api/maxPriorityFeePerGas', async (req, res) => {
  const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas
  console.log('max priority fee per gas: ', maxPriorityFeePerGas)
  res.send({maxPriorityFeePerGas})
})

// Get token symbol
app.get('/api/symbol', async (req, res) => {
  const { address } = req.query
  const metadata = await alchemy.core.getTokenMetadata(address)
  const symbol = metadata.symbol
  console.log('symbol: ', symbol)
  res.send({symbol})
})

// Get tokens
app.get('/api/tokens', async (req, res) => {
  const { address } = req.query

  var tokensObject = {tokensArray: []}

  var nativeObj = {
    address: String,
    readableString: String
  }

  var nativeBalance = await alchemy.core.getBalance(address)
  nativeBalance = Utils.formatEther(nativeBalance)
  console.log('native balance: ', nativeBalance)


  nativeObj.address = ''
  nativeObj.readableString = `Ethers: ${nativeBalance} ETH`
  tokensObject.tokensArray.push(nativeObj)

  const balances = await alchemy.core.getTokenBalances(address)
  const nonZeroBalances = balances.tokenBalances.filter((token) => {
    return token.tokenBalance !== "0";
  });

  for (let token of nonZeroBalances) {

    var tokenObj = {
      address: String,
      readableString: String
    }

    let balance = token.tokenBalance
    const metadata = await alchemy.core.getTokenMetadata(token.contractAddress)
    balance = balance / Math.pow(10, metadata.decimals);
    balance = balance.toFixed(4);

    tokenObj.address = token.contractAddress
    tokenObj.readableString = `${metadata.name}: ${balance} ${metadata.symbol}`

    tokensObject.tokensArray.push(tokenObj)
  }

  console.log('token object to be sent: ', tokensObject)

  res.send(tokensObject)
})

//Get dollar price
app.get('/api/dollarprice', async (req, res) => {
  const { address } = req.query

  console.log('address: ', address)

  try {

    const response = await Moralis.EvmApi.token.getTokenPrice({
      "chain": "0x1",
      "exchange": "uniswap-v2",
      "address": "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0" //hardcoded for now
    });

    console.log('moralis raw response', response.raw);

    const dollarPrice = response.raw.usdPrice

    console.log('usd price: ', dollarPrice)

    //later pass the amount and return dollar value, not price

    res.send({dollarPrice})

  } catch (error) {
    console.log('moralis error: ', error)
  }

})


app.listen(port, '0.0.0.0',() => {
  console.log(`Web3Gifts backend app listening on port ${port}`)
})
