import { useMoralis, useMoralisQuery } from "react-moralis";
import { useQuery } from "@apollo/client";
import NftBox from "../components/NftBox";
import networkMapping from "../constants/networkMapping";
import { GET_ACTIVE_ITEMS } from "../constants/graphQueries";

export default function Home() {
  const { isWeb3Enabled, chainId } = useMoralis();
  const marketplaceAddress =
    chainId && networkMapping[parseInt(chainId)]?.nftMarketplace[0];
  const { loading, data } = useQuery(GET_ACTIVE_ITEMS);

  return (
    <div className="container mx-auto">
      <h1 className="p-4 font-bold text-2xl">Recently Listed NFTs</h1>
      <div className="flex flex-wrap">
        {isWeb3Enabled ? (
          loading || !data ? (
            <div>Loading...</div>
          ) : (
            data.activeItems.map((nft) => {
              return (
                <div key={nft.id}>
                  <NftBox {...nft} marketplaceAddress={marketplaceAddress} />
                </div>
              );
            })
          )
        ) : (
          <div>Web 3 is currently not enabled</div>
        )}
      </div>
    </div>
  );
}
