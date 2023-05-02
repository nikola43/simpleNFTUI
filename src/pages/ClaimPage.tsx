import { useWeb3React } from "@web3-react/core";
import NftMintAbi from "../blockchain/abi/NftMint.json";
import toast, { Toaster } from "react-hot-toast";
import { useState } from "react";
import { formatEther, parseEther } from "ethers";

const NftMintAddress = "0xbCDF8fDCA509DA0255eA2801F2B40d207484EDaC";
const USDTAddress = "0x263f90bcA00A6E987334D55501Bd8C0D081CeE62";

function ClaimPage() {
	const { active, account, library, activate, deactivate, chainId } =
		useWeb3React();

	const [isClaimLoading, setIsClaimLoading] = useState(false);
	const [claimableAmount, setClaimableAmount] = useState("0");

	let kittieNft1: any;

	const getClaimableAmount = async () => {
		const claimable = await kittieNft1.methods
			.getAllClaimableRewards(account)
			.call();

		setClaimableAmount(formatEther(claimable));

		console.log(claimable);
	};

	if (library) {
		kittieNft1 = new library.eth.Contract(NftMintAbi, NftMintAddress);

		getClaimableAmount();
	}

	const claimRewards = async () => {
		setIsClaimLoading(true);
		await kittieNft1.methods
			.claimAllRewards()
			.send({ from: account })
			.then(
				(res: any) => {
					console.log(res);
					toast.success("Claimed Successfully");
					setIsClaimLoading(false);
				},
				(err: any) => {
					console.log(err);
					toast.error(err.message);
					setIsClaimLoading(false);
				}
			);
	};

	return (
		<div className="container-background">
			<div className="claim_reward">
				<div>
					<h1>Claim NFT Holding rewards</h1>
					<div className="claim_box">
						<p>NftMint is a collection of 160 unique NFTs</p> <br />
						<p>Amount of ETH to claim: {claimableAmount} ETH</p>
						<div className="btn_design">
							<button
								className="claim_btn"
								onClick={claimRewards}
							>
								Claim your Reward
								{isClaimLoading ? (
									<div className="loader"></div>
								) : null}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ClaimPage;
