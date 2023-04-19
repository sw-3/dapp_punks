import { ethers } from 'ethers'

const Data = ({ maxSupply, totalSupply, cost, maxMintAmount, balance, chainId }) => {
	return(
		<div className='text-center'>
			<p><strong>Available to Mint:</strong> {maxSupply - totalSupply}</p>
			{(chainId === 80001) ? (
				<p><strong>Cost to Mint:</strong> {ethers.utils.formatUnits(cost, 'ether')} MATIC</p>
			) : (
				<p><strong>Cost to Mint:</strong> {ethers.utils.formatUnits(cost, 'ether')} ETH</p>
			)}
			<p><strong>Maximum Mint Per Account:</strong> {maxMintAmount.toString()}</p>
			<p><strong>You own:</strong> {balance.toString()}</p>
		</div>
	)
}

export default Data
