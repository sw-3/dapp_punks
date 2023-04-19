import { useEffect, useState } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import Countdown from 'react-countdown'
import { ethers } from 'ethers'

import preview from '../preview.png'

// Components
import Navigation from './Navigation'
import Data from './Data'
import Mint from './Mint'
import Loading from './Loading'
import OwnerUI from './OwnerUI'

// ABIs: Import your contract ABIs here
import NFT_ABI from '../abis/NFT.json'

// Config: Import your network config here
import config from '../config.json'

function App() {
  const [provider, setProvider] = useState(null)
  const [chainId, setChainId] = useState('')
  const [nft, setNFT] = useState(null)

  const [account, setAccount] = useState(null)

  const [revealTime, setRevealTime] = useState(0)
  const [maxSupply, setMaxSupply] = useState(0)
  const [maxMintAmount, setMaxMintAmount] = useState(0)
  const [totalSupply, setTotalSupply] = useState(0)
  const [cost, setCost] = useState(0)
  const [balance, setBalance] = useState(0)
  const [tokenIds, setTokenIds] = useState(null)
  const [whitelisted, setWhitelisted] = useState(false)
  const [isOwner, setIsOwner] = useState(false)

  const [isLoading, setIsLoading] = useState(true)

  const loadBlockchainData = async () => {
    // Initiate provider
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)

    const { chainId } = await provider.getNetwork()
    // console.log(`chainId = ${chainId}`)
    setChainId(chainId)

    // initiate contract
    const nft = new ethers.Contract(config[chainId].nft.address, NFT_ABI, provider)
    setNFT(nft)

    // Fetch accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = ethers.utils.getAddress(accounts[0])
    setAccount(account)

    // fetch countdown
    const allowMintingOn = await nft.allowMintingOn() * 1000  // need in miliseconds in js
    setRevealTime(allowMintingOn)

    // fetch contract data
    setMaxSupply(await nft.maxSupply())
    setTotalSupply(await nft.totalSupply())
    setMaxMintAmount(await nft.maxMintAmount())
    setCost(await nft.cost())

    // fetch balance and whitelist state of account
    setBalance(await nft.balanceOf(account))
    setTokenIds(await nft.walletOfOwner(account))
    const iswl = await nft.whitelist(account)
    setWhitelisted(iswl)

    if ((await nft.owner()) === account) {
      setIsOwner(true)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    if (isLoading) {
      loadBlockchainData()
    }
  }, [isLoading]);

  return(
    <Container>
      <Navigation account={account} />

      <h1 className='my-4 text-center'>Dapp Punks</h1>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <Row>
            <Col>
              {balance > 0 ? (
                <>
                <Row>
                  <Col>
                    <div className='text-center'>
                      <img
                        src={`https://gateway.pinata.cloud/ipfs/QmQPEMsfd1tJnqYPbnTQCjoa8vczfsV1FmqZWgRdNQ7z3g/${tokenIds[0].toString()}.png`}
                        alt= 'Open Punk'
                        width='200px'
                        height='200px'
                      />
                    </div>
                  </Col>
                    {balance > 1 ? (
                      <Col>
                        <div className='text-center'>
                          <img
                            src={`https://gateway.pinata.cloud/ipfs/QmQPEMsfd1tJnqYPbnTQCjoa8vczfsV1FmqZWgRdNQ7z3g/${tokenIds[1].toString()}.png`}
                            alt= 'Open Punk'
                            width='200px'
                            height='200px'
                          />
                        </div>
                      </Col>
                    ) : (
                      <p> </p>
                    )}

                </Row>
                <Row>
                  {balance > 2 ? (
                    <Col>
                      <div className='text-center'>
                        <img
                          src={`https://gateway.pinata.cloud/ipfs/QmQPEMsfd1tJnqYPbnTQCjoa8vczfsV1FmqZWgRdNQ7z3g/${tokenIds[2].toString()}.png`}
                          alt= 'Open Punk'
                          width='200px'
                          height='200px'
                        />
                      </div>
                    </Col>
                  ) : (
                    <p> </p>
                  )}

                  {balance > 3 ? (
                    <Col>
                      <div className='text-center'>
                        <img
                          src={`https://gateway.pinata.cloud/ipfs/QmQPEMsfd1tJnqYPbnTQCjoa8vczfsV1FmqZWgRdNQ7z3g/${tokenIds[3].toString()}.png`}
                          alt= 'Open Punk'
                          width='200px'
                          height='200px'
                        />
                      </div>
                    </Col>
                  ) : (
                    <p> </p>
                  )}

                </Row>
                </>
              ) : (
                <img src={preview} alt='' />
              )}
            </Col>

            <Col>
              <div className='my-4 text-center'>
                <Countdown date={revealTime} className='h2' />
              </div>

              <Data
                maxSupply={maxSupply}
                totalSupply={totalSupply}
                cost={cost}
                maxMintAmount={maxMintAmount}
                balance={balance}
                chainId={chainId}
              />

              <Mint
                provider={provider}
                nft={nft}
                cost={cost}
                maxMintAmount={maxMintAmount}
                whitelisted={whitelisted}
                setIsLoading={setIsLoading}
              />
            </Col>

          </Row>

          {(isOwner) ? (
            <OwnerUI
              provider={provider}
              nft={nft}
              setIsLoading={setIsLoading}
            />
          ) : (
            <p> </p>
          )}

        </>
      )}
    </Container>
  )
}

export default App;
