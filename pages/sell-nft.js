import { ethers } from "ethers";
import { Form, useNotification } from "web3uikit";
import nftAbi from "../constants/basicNftAbi.json";
import nftMarketplaceAbi from "../constants/nftMarketplaceAbi.json";
import networkMapping from "../constants/networkMapping.json";
import { useMoralis, useWeb3Contract } from "react-moralis";

export default function SellNft() {
  const { chainId } = useMoralis();
  const { runContractFunction } = useWeb3Contract();
  const dispatch = useNotification();

  const approveAndList = async ({ data }) => {
    const marketplaceAddress =
      chainId && networkMapping[parseInt(chainId)]?.nftMarketplace.pop();
    const nftAddress = data[0].inputResult;
    const tokenId = data[1].inputResult;
    const price = ethers.utils.parseEther(data[2].inputResult || "0");

    const approveOptions = {
      abi: nftAbi,
      contractAddress: nftAddress,
      functionName: "approve",
      params: {
        to: marketplaceAddress,
        tokenId,
      },
    };

    await runContractFunction({
      params: approveOptions,
      onSuccess: () =>
        handleApproveSuccess(marketplaceAddress, nftAddress, tokenId, price),
      onError: (error) => console.error(error),
    });
  };

  const handleApproveSuccess = async (
    marketplaceAddress,
    nftAddress,
    tokenId,
    price
  ) => {
    const listOptions = {
      abi: nftMarketplaceAbi,
      contractAddress: marketplaceAddress,
      functionName: "listItem",
      params: {
        nftAddress,
        tokenId,
        price,
      },
    };

    await runContractFunction({
      params: listOptions,
      onSuccess: handleListingSuccess,
      onError: (error) => console.error(error),
    });
  };

  const handleListingSuccess = async (tx) => {
    await tx.wait(1);
    dispatch({
      type: "success",
      title: "List Item",
      message: "Waiting to send transaction",
      position: "topR",
    });
  };

  return (
    <div className="container">
      <Form
        buttonConfig={{
          theme: "primary",
        }}
        data={[
          {
            name: "NFT Address",
            type: "text",
            inputWidth: "50%",
            value: "",
            key: "nftAddress",
          },
          {
            name: "Token ID",
            type: "number",
            inputWidth: "50%",
            value: "",
            key: "tokenId",
          },
          {
            name: "Price (in ETH)",
            type: "number",
            inputWidth: "50%",
            value: "",
            key: "price ",
          },
        ]}
        title="Sell your NFT"
        id="mainFrom"
        onSubmit={approveAndList}
      ></Form>
    </div>
  );
}
