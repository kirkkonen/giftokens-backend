import Web3 from "web3"
import { contractAbi } from "./nft-abi.js";
import HDWalletProvider from '@truffle/hdwallet-provider'
import dotenv from "dotenv"

dotenv.config()

//const Provider = require('@truffle/hdwallet-provider');
//require("dotenv").config();

const SmartContractAddress = process.env.NFT_CONTRACT;
const callerAddress = process.env.CALLER_ADDRESS;
const privatekey = process.env.SEEDPHRASE;
const rpcurl = process.env.RPCURL;

const provider = new HDWalletProvider(privatekey, rpcurl);
const web3 = new Web3(provider);
const nftContract = new web3.eth.Contract(contractAbi, SmartContractAddress);

// Arguments: beneficiary, tokenID, tokenURI, amount of tokens minted, staking contract
// All hardcoded for now

async function mintAndAttach() {
    console.log("started creating an NFT");
    const tokenID = Math.floor(Math.random() * 10000)
    nftContract.methods.mintAndAttach(
        "0x0000000000000000000000000000000000000000",
        tokenID,
        'https://ipfs.io/ipfs/QmaC2jpcYjFhimuvR3MCGE1cWkLVu96pNX2z89srbhcEkP',
        100000,
        '0xca313E9f92A184A500A2E90d64f605500B9F0235'
    ).send({ from: callerAddress });
    console.log("NFT created");
    return tokenID;
  }

//module.exports.mintAndAttach = mintAndAttach;

const _mintAndAttach = mintAndAttach;
export { _mintAndAttach as mintAndAttach };