import {
    ethers
} from "./ethers-5.6.esm.min.js"

import {
    abi,
    contractAddress
} from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
    if (window.ethereum !== "undefined") {
        await window.ethereum.request({
            method: "eth_requestAccounts"
        });
        connectButton.innerHTML = "Connected!"
    } else {
        connectButton.innerHTML = "Please install metamask!"
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding: ${ethAmount}..`);
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount)
            })
            // wait for this transaction to complete
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done");
        } catch (error) {
            console.log(error)
        }
    }

}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`mining transaction with hash: ${transactionResponse.hash}..`);
    // listen for transaction to finish
    return new Promise(function (resolve, reject) {
        provider.once(transactionResponse.hash, function (transactionReceipt) {
            console.log(`completed transaction with ${transactionReceipt.confirmations} confirmations`);
            resolve()
        })
    })
}

async function withdraw() {
    console.log("withdrawing...")
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}