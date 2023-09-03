import Web3 from "web3"
import { targetContractAbi } from "./target-abi";
import HDWalletProvider from '@truffle/hdwallet-provider'
import dotenv from "dotenv"
dotenv.config()

// const Provider = require('@truffle/hdwallet-provider');
// require("dotenv").config();

const SmartContractAddress = process.env.TARGET_CONTRACT;
const callerAddress = process.env.CALLER_ADDRESS;
const privatekey = process.env.SEEDPHRASE;
const rpcurl = process.env.RPCURL;

const provider = new HDWalletProvider(privatekey, rpcurl);
const web3 = new Web3(provider);
const targetContract = new web3.eth.Contract(targetContractAbi, SmartContractAddress);


async function estimateGas(stakeAmount, beneficiary) {
    console.log("started estimating gas");

    targetContract.methods.stake(stakeAmount).estimateGas({from: beneficiary})
        .then(function(gasAmount){
            return gasAmount
        })
        .catch(function(error){
            console.log('gas amount estimation failed: ', error)
        })
  }

//module.exports.mintAndAttach = mintAndAttach;

const _estimateGas = estimateGas;
export { _estimateGas as estimateGas };