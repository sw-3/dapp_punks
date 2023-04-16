import { useState } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Spinner from 'react-bootstrap/Spinner'

const Mint = ({ provider, nft, cost, maxMintAmount, whitelisted, setIsLoading }) => {
	const [amount, setAmount] = useState('0')
	const [isWaiting, setIsWaiting] = useState(false)

	const mintHandler = async (e) => {
		e.preventDefault()
		setIsWaiting(true)

		try {
			if (!whitelisted) {
				window.alert('Only whitelisted accounts can mint a Dapp Punk.')
			}
			else if (amount > maxMintAmount) {
				window.alert(`Cannot mint more than ${maxMintAmount} NFTs.`)
			}
			else {
				const signer = await provider.getSigner()
				const value = (cost * amount).toString()
				const transaction = await nft.connect(signer).mint(amount, { value: value })
				await transaction.wait()
			}

		} catch {
			window.alert('User rejected or transaction reverted')
		}

		setIsLoading(true)
	}

	return(
		<Form onSubmit={mintHandler} style={{ maxWidth: '300px', margin: '50px auto' }}>
			<Form.Group as={Row}>
				<Col>
					<Form.Control type='number' placeholder='# to mint' onChange={(e) => setAmount(e.target.value)}/>
				</Col>
				<Col className='text-center'>
					{isWaiting ? (
							<Spinner animation='border' style={{ display: 'block', margin: '0 auto' }} />
						) : (

							// <Form.Group>
								<Button variant='primary' type='submit' style={{ width: '100%' }}>
									Mint
								</Button>
							// </Form.Group>
						)}
				</Col>
			</Form.Group>
		</Form>
	)
}

export default Mint
