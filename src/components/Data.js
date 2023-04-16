import { ethers } from 'ethers'

const Data = ({ maxSupply, totalSupply, cost, maxMintAmount, balance }) => {
	return(
		<div className='text-center'>
			<p><strong>Available to Mint:</strong> {maxSupply - totalSupply}</p>
			<p><strong>Cost to Mint:</strong> {ethers.utils.formatUnits(cost, 'ether')} ETH</p>
			<p><strong>Maximum Mint Per Account:</strong> {maxMintAmount.toString()}</p>
			<p><strong>You own:</strong> {balance.toString()}</p>
		</div>
	)
}

export default Data
