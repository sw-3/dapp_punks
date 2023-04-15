const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('NFT', () => {
  const NAME = 'Dapp Punks'
  const SYMBOL = 'DP'
  const COST = ether(10)
  const MAX_SUPPLY = 25
  const MAX_MINT_AMOUNT = 3
  const BASE_URI = 'ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/'

  let nft,
      deployer,
      minter

  beforeEach(async () => {
    let accounts = await ethers.getSigners()
    deployer = accounts[0]
    minter = accounts[1]
  })


  describe('Deployment', () => {
    const ALLOW_MINTING_ON = (Date.now() + 120000).toString().slice(0, 10)

    beforeEach(async () => {
      const NFT = await ethers.getContractFactory('NFT')
      nft = await NFT.deploy(
        NAME,
        SYMBOL,
        COST,
        MAX_SUPPLY,
        MAX_MINT_AMOUNT,
        ALLOW_MINTING_ON,
        BASE_URI)
    })

    it('has correct name', async () => {
      expect(await nft.name()).to.equal(NAME)
    })

    it('has correct symbol', async () => {
      expect(await nft.symbol()).to.equal(SYMBOL)
    })

    it('returns the cost to mint', async () => {
      expect(await nft.cost()).to.equal(COST)
    })

    it('returns the maximum total supply', async () => {
      expect(await nft.maxSupply()).to.equal(MAX_SUPPLY)
    })

    it('returns the maximum mint amount', async () => {
      expect(await nft.maxMintAmount()).to.equal(MAX_MINT_AMOUNT)
    })

    it('returns the allowed minting time', async () => {
      expect(await nft.allowMintingOn()).to.equal(ALLOW_MINTING_ON)
    })

    it('returns the base URI', async () => {
      expect(await nft.baseURI()).to.equal(BASE_URI)
    })

    it('returns the owner', async () => {
      expect(await nft.owner()).to.equal(deployer.address)
    })

  })

  describe('Minting', () => {
    let transaction, result

    describe('Success', async () => {

      const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10)

      beforeEach(async () => {
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT_AMOUNT, ALLOW_MINTING_ON, BASE_URI)
        transaction = await nft.connect(deployer).addToWhitelist(minter.address)
        result = await transaction.wait()

        transaction = await nft.connect(minter).mint(1, { value: COST })
        result = await transaction.wait()
      })

      it('returns the address of the minter', async () => {
        expect(await nft.ownerOf(1)).to.equal(minter.address)
      })

      it('returns total number of tokens the minter owns', async () => {
        expect(await nft.balanceOf(minter.address)).to.equal(1)
      })

      it('returns IPFS URI', async () => {
        expect(await nft.tokenURI(1)).to.equal(`${BASE_URI}1.json`)
      })

      it('updates the total supply', async () => {
        expect(await nft.totalSupply()).to.equal(1)
      })

      it('updates the contract ether balance', async () => {
        expect(await ethers.provider.getBalance(nft.address)).to.equal(COST)
      })

      it('emits Mint event', async () => {
        await expect(transaction).to.emit(nft, 'Mint')
          .withArgs(1, minter.address)
      })

    })

    describe('Failure', async () => {
      let nft2
      const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10)

      beforeEach(async () => {
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT_AMOUNT, ALLOW_MINTING_ON, BASE_URI)
        transaction = await nft.connect(deployer).addToWhitelist(minter.address)
        result = await transaction.wait()
      })

      it('rejects insufficient payment', async () => {
        await expect(nft.connect(minter).mint(2, { value: COST })).to.be.reverted
      })

      it('rejects minting before time', async () => {
        const ALW_MINT_ON = new Date('May26, 2030 18:00:00').getTime().toString().slice(0, 10)
        const NFT2 = await ethers.getContractFactory('NFT')
        nft2 = await NFT2.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT_AMOUNT, ALW_MINT_ON, BASE_URI)
        transaction = await nft2.connect(deployer).addToWhitelist(minter.address)
        result = await transaction.wait()

        await expect(nft2.connect(minter).mint(1, { value: COST })).to.be.reverted
      })

      it('requires at least 1 NFT to be minted', async () => {
        await expect(nft.connect(minter).mint(0, { value: COST })).to.be.reverted
      })

      it('does not allow more than total NFTs to be minted', async () => {
        const MX_SUPP = 2
        const NFT2 = await ethers.getContractFactory('NFT')
        nft2 = await NFT2.deploy(NAME, SYMBOL, COST, MX_SUPP, MAX_MINT_AMOUNT, ALLOW_MINTING_ON, BASE_URI)
        transaction = await nft2.connect(deployer).addToWhitelist(minter.address)
        result = await transaction.wait()

        await expect(nft2.connect(minter).mint(3, { value: ether(30) })).to.be.reverted
      })

      it('does not allow more than maximum allowed per address (multiple mints)', async () => {
        transaction = await nft.connect(minter).mint(2, { value: ether(20) })
        result = await transaction.wait()

        await expect(nft.connect(minter).mint(2, { value: ether(20) })).to.be.reverted
      })

      it('does not allow more than maximum allowed per address (single mint)', async () => {
        await expect(nft.connect(minter).mint(4, { value: ether(40) })).to.be.reverted
      })

      it('does not return URI for invalid token', async () => {
        transaction = await nft.connect(minter).mint(1, { value: COST })
        await transaction.wait()

        await expect(nft.tokenURI(99)).to.be.reverted
      })

    })

  })

  describe('Displaying NFTs', () => {
    let transaction, result

    const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10)

    beforeEach(async () => {
      const NFT = await ethers.getContractFactory('NFT')
      nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT_AMOUNT, ALLOW_MINTING_ON, BASE_URI)
      transaction = await nft.connect(deployer).addToWhitelist(minter.address)
      result = await transaction.wait()

      transaction = await nft.connect(minter).mint(3, { value: ether(30) })
      result = await transaction.wait()
    })

    it('return all the NFTs for a given owner', async () => {
      let tokenIds = await nft.walletOfOwner(minter.address)

      expect(tokenIds.length).to.equal(3)
      expect(tokenIds[0].toString()).to.equal('1')
      expect(tokenIds[1].toString()).to.equal('2')
      expect(tokenIds[2].toString()).to.equal('3')
    })

  })

  describe('Withdraw', () => {

    describe('Success', async () => {
      let transaction, result, balanceBefore

      const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10)

      beforeEach(async () => {
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT_AMOUNT, ALLOW_MINTING_ON, BASE_URI)
        transaction = await nft.connect(deployer).addToWhitelist(minter.address)
        result = await transaction.wait()

        transaction = await nft.connect(minter).mint(1, { value: COST })
        result = await transaction.wait()

        balanceBefore = await ethers.provider.getBalance(deployer.address)

        transaction = await nft.connect(deployer).withdraw()
        result = await transaction.wait()
      })

      it('deducts the contract balance', async () => {
        expect(await ethers.provider.getBalance(nft.address)).to.equal(0)
      })

      it('sends funds to the owner', async () => {
        expect(await ethers.provider.getBalance(deployer.address)).to.be.greaterThan(balanceBefore)
      })

      it('emits Withdraw event', async () => {
        expect(transaction).to.emit(nft, 'Withdraw')
          .withArgs(COST, deployer.address)
      })

    })

    describe('Failure', async () => {

      it('prevents non-owner from withdrawing', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10)
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT_AMOUNT, ALLOW_MINTING_ON, BASE_URI)
        transaction = await nft.connect(deployer).addToWhitelist(minter.address)
        result = await transaction.wait()
        transaction = await nft.connect(minter).mint(1, { value: COST })
        result = await transaction.wait()

        await expect(nft.connect(minter).withdraw()).to.be.reverted
      })

    })
  })

  describe('Add To Whitelist', () => {

    describe('Success', async () => {
      let transaction, result, balanceBefore

      const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10)

      beforeEach(async () => {
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT_AMOUNT, ALLOW_MINTING_ON, BASE_URI)
      })

      it('adds address to whitelist', async () => {
        expect(await nft.whitelist(minter.address)).to.equal(false)
        transaction = await nft.connect(deployer).addToWhitelist(minter.address)
        result = await transaction.wait()

        expect(await nft.whitelist(minter.address)).to.equal(true)
      })

      it('allows whitelisted address to mint', async () => {
        transaction = await nft.connect(deployer).addToWhitelist(minter.address)
        result = await transaction.wait()

        transaction = await nft.connect(minter).mint(1, { value: COST })
        result = await transaction.wait()
        expect(await nft.ownerOf(1)).to.equal(minter.address)
      })

      it('emits AddToWhitelist event', async () => {
        transaction = await nft.connect(deployer).addToWhitelist(minter.address)
        result = await transaction.wait()

        expect(transaction).to.emit(nft, 'AddToWhitelist')
          .withArgs(minter.address)
      })

    })

    describe('Failure', async () => {

      it('prevents non-owner from adding to whitelist', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10)
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT_AMOUNT, ALLOW_MINTING_ON, BASE_URI)

        await expect(nft.connect(minter).addToWhitelist(minter.address)).to.be.reverted
      })

      it('prevents non-whitelist address from minting', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10)
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT_AMOUNT, ALLOW_MINTING_ON, BASE_URI)

        await expect(nft.connect(minter).mint(1, { value: COST })).to.be.reverted
      })

    })
  })
})
