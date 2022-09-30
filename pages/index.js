import { useMoralis, useMoralisQuery } from "react-moralis";
import NftBox from "../components/NftBox";

export default function Home() {
  const { isWeb3Enabled } = useMoralis();
  const { data: nftList, isFetching: fetchingNftList } = useMoralisQuery(
    "ActiveItem",
    (query) => query.limit(10).descending("tokenId")
  );

  return (
    <div className="container mx-auto">
      <h1 className="p-4 font-bold text-2xl">Recently Listed NFTs</h1>
      <div className="flex flex-wrap">
        {isWeb3Enabled ? (
          fetchingNftList ? (
            <div>Loading...</div>
          ) : (
            nftList.map(({ id, attributes }) => {
              console.log(attributes);
              return (
                <div key={id}>
                  <NftBox {...attributes} />
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
