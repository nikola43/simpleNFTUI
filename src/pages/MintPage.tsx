import { useWeb3React } from "@web3-react/core";

import type1 from "../Materials/type1.jpg";

// import abi file
import nftMintContractAbi from "../blockchain/abi/NftMint.json";
import usdtAbi from "../blockchain/abi/Token.json";
import toast, { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import { formatUnits } from "ethers";

const NftMintAddress = "0xbCDF8fDCA509DA0255eA2801F2B40d207484EDaC";
const USDTAddress = "0x43B552A6A5B97f120788A8751547D5D953eFBBcA";

function App() {
	const { active, account, library, activate, deactivate, chainId } =
		useWeb3React();

	const [isMintingOneLoading, setIsMintingOneLoading] = useState(false);
	const [isApproveLoading, setIsApproveLoading] = useState(false);
	const [cost, setCost] = useState("0");
	const [allowance, setAllowance] = useState("0");
	const [amount, setAmount] = useState(1);
	const [mintedAmount, setMintedAmount] = useState(0);
	const [maxSupply, setMaxSupply] = useState("0");

	let nftMintContract: any;
	let usdtContract: any;

	if (library) {
		nftMintContract = new library.eth.Contract(
			nftMintContractAbi,
			NftMintAddress
		);

		usdtContract = new library.eth.Contract(usdtAbi, USDTAddress);
	}

	useEffect(() => {
		if (account) {
			getUSDTAllowance().then(() => {});

			getCost().then(() => {});

			getTotalSupply().then(() => {});

			getMaxSupply().then(() => {});
		}
	}, [account]);

	async function getUSDTAllowance() {
		const allowance: string = await usdtContract.methods
			.allowance(account, NftMintAddress)
			.call();
		setAllowance(allowance);
	}

	async function getTotalSupply() {
		const minted: string = await nftMintContract.methods
			.totalSupply()
			.call();
		setMintedAmount(parseInt(minted));
	}

	async function getMaxSupply() {
		const max: string = await nftMintContract.methods.maxSupply().call();
		setMaxSupply(max);
	}

	async function getCost() {
		const cost: string = await nftMintContract.methods.cost().call();
		setCost(cost);
	}

	async function getUsdtBalance(): Promise<string> {
		const balance: string = await usdtContract.methods
			.balanceOf(account)
			.call();
		return balance;
	}

	async function approveUSDT() {
		console.log("Approving USDT");
		setIsApproveLoading(true);

		await usdtContract.methods
			.approve(
				NftMintAddress,
				"0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
			)
			.send({ from: account })
			.then(
				(res: any) => {
					console.log(res);
					toast.success("Approved Successfully");
					setIsApproveLoading(false);
					getUSDTAllowance().then(() => {
						console.log("Allowance: ", allowance);
					});

					getTotalSupply().then(() => {
						console.log("Minted: ", mintedAmount);
					});
				},
				(err: any) => {
					console.log(err);
					toast.error(err.message);
					setIsApproveLoading(false);
				}
			);

		console.log("Approving USDT");

		setIsApproveLoading(false);
	}

	// function for minting
	async function mintNFT(mintAmount: number) {
		const usdtBalance = await getUsdtBalance();

		if (Number(usdtBalance) < Number(cost) * mintAmount) {
			toast.error(
				"Insufficient USDT Balance, required " +
					Number(formatUnits(cost, "ether")) * mintAmount +
					" USDT"
			);
			return;
		}

		setIsMintingOneLoading(true);

		await nftMintContract.methods
			.mintNFTs(mintAmount)
			.send({ from: account })
			.then(
				(res: any) => {
					console.log(res);
					toast.success("Minted Successfully");
					setIsMintingOneLoading(false);
				},
				(err: any) => {
					console.log(err);
					toast.error(err.message);
					setIsMintingOneLoading(false);
				}
			);
	}

	return (
		<div className="container-background">
			<div className="contant_section">
				<div>
					<h1>Minting Page</h1>
					<p>nftMintContract is a collection of 160 unique NFTs</p>
				</div>
			</div>

			<section className="box_section">
				<img src={type1} style={{ width: "18rem" }} alt="" />
				<h3>Cost {formatUnits(cost, "ether")} USDT</h3>
				<h3>Minted {mintedAmount} / 160</h3>

				<label htmlFor="amount">Amount</label>
				<input
					name="amount"
					placeholder="Amount"
					value={amount}
					type="number"
					onChange={(e) => {
						//e.preventDefault();
						console.log(e);
						if (Number(e.target.value) === 0) {
							setAmount(1);
						}
						if (Number(e.target.value) >= 160) {
							setAmount(160);
							e.target.value = "160";
						} else {
							setAmount(Number(e.target.value));
						}
					}}
				></input>

				<div>
					{allowance === "0" ? (
						<button className="btn1" onClick={approveUSDT}>
							Approve
							{isApproveLoading ? (
								<div className="loader"></div>
							) : null}
						</button>
					) : (
						<button
							className="btn1"
							onClick={() => {
								mintNFT(amount).then(() => {});
							}}
						>
							Mint Now
							{isMintingOneLoading ? (
								<div className="loader"></div>
							) : null}
						</button>
					)}
				</div>
				<br></br>
			</section>

			<Toaster />
		</div>
	);
}

export default App;
