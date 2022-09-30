import { ethers } from "ethers";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { Card, useNotification } from "web3uikit";
import nftAbi from "../constants/basicNftAbi.json";
import nftMarketplaceAbi from "../constants/nftMarketplaceAbi.json";
import UpdateListingModal from "./UpdateListingModal";

const truncateStr = (fullStr, strLen) => {
  if (fullStr.length <= strLen) return fullStr;

  const separator = "...";
  const separatorLength = separator.length;
  const charsToShow = strLen - separatorLength;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);
  return (
    fullStr.substring(0, frontChars) +
    separator +
    fullStr.substring(fullStr.length - backChars)
  );
};

export default function NftBox(props) {
  const { price, nftAddress, tokenId, seller, marketplaceAddress } = props;

  const [imageUri, setImageUri] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenDescription, setTokenDescription] = useState("");
  const [showModal, setShowModal] = useState(false);

  const dispatch = useNotification();

  const { isWeb3Enabled, account } = useMoralis();
  const { runContractFunction: getTokenUri } = useWeb3Contract({
    abi: nftAbi,
    contractAddress: nftAddress,
    functionName: "tokenURI",
    params: { tokenId: 0 },
  });
  const { runContractFunction: buyItem } = useWeb3Contract({
    abi: nftMarketplaceAbi,
    contractAddress: marketplaceAddress,
    functionName: "buyItem",
    msgValue: price,
    params: {
      nftAddress,
      tokenId,
    },
  });

  const isOwner = seller === account || seller === undefined;
  const formattedSellerAddress = isOwner
    ? "you"
    : truncateStr(seller || "", 15);

  async function updateUI() {
    const tokenUri = await getTokenUri();
    if (tokenUri) {
      const requestUrl = tokenUri.replace("ipfs://", "https://ipfs.io/ipfs/");
      const tokenMetadata = await (await fetch(requestUrl)).json();
      setImageUri(tokenMetadata.image);
      setTokenName(tokenMetadata.name);
      setTokenDescription(tokenMetadata.description);
    }
  }

  const hideModal = () => setShowModal(false);

  const handleBuyItem = () => {
    buyItem({
      onError: (e) => console.error(e),
      onSuccess: handleBoughtItemSuccess,
    });
  };

  const handleBoughtItemSuccess = async (tx) => {
    await tx.wait(1);
    dispatch({
      type: "success",
      message: "Item bought",
      title: "Waiting to finish...",
      position: "topR",
    });
  };

  const handleCardClick = () => {
    isOwner ? setShowModal(true) : handleBuyItem();
  };

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);

  return (
    <div>
      <div>
        {imageUri ? (
          <div>
            <UpdateListingModal
              props={props}
              isVisible={showModal}
              onClose={hideModal}
            />
            <Card
              title={tokenName}
              description={tokenDescription}
              onClick={handleCardClick}
            >
              <div className="p-2">
                <div className="flex flex-col items-end gap-2">
                  <div>#{tokenId}</div>
                  <div className="italic text-sm">
                    Owned by {formattedSellerAddress}
                  </div>
                  <Image
                    loader={() => imageUri}
                    src={imageUri}
                    height="200"
                    width="200"
                  />
                  <div className="font-bold">
                    {ethers.utils.formatUnits(price, "ether")} ETH
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
}
