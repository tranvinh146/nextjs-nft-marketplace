import { ethers } from "ethers";
import { useState } from "react";
import { useWeb3Contract } from "react-moralis";
import { Input, Modal, useNotification } from "web3uikit";
import nftMarketplaceAbi from "../constants/nftMarketplaceAbi.json";

export default function UpdateListingModal({ props, isVisible, onClose }) {
  const { nftAddress, tokenId, marketplaceAddress } = props;

  const dispatch = useNotification();

  const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState(0);

  const { runContractFunction: updateItem } = useWeb3Contract({
    abi: nftMarketplaceAbi,
    contractAddress: marketplaceAddress,
    functionName: "updateItem",
    params: {
      nftAddress,
      tokenId,
      newPrice: ethers.utils.parseEther(priceToUpdateListingWith || "0"),
    },
  });

  const handleUpdatePrice = () => {
    updateItem({
      onError: (error) => console.error(error),
      onSuccess: handleUpdatedItemSuccess,
    });
  };

  const handleUpdatedItemSuccess = async (tx) => {
    await tx.wait(1);
    dispatch({
      type: "success",
      message: "Item updated",
      title: "Item updated- please refresh (and move blocks)",
      position: "topR",
    });
    onClose && onClose();
    setPriceToUpdateListingWith("0");
  };

  return (
    <Modal
      isVisible={isVisible}
      onCancel={onClose}
      onCloseButtonPressed={onClose}
      onOk={handleUpdatePrice}
    >
      <Input
        label="Update listing price in L1 Currency (ETH)"
        name="New listing price"
        type="number"
        onChange={(event) => {
          setPriceToUpdateListingWith(event.target.value);
        }}
      ></Input>
    </Modal>
  );
}
