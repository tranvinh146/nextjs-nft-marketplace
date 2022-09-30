// Create a new table called "ActiveItem"
// Add items when they are listed on the marketplace
// Remove them when they are bought

Moralis.Cloud.afterSave("ItemListed", async (request) => {
  const confirmed = request.object.get("confirmed");
  const logger = Moralis.Cloud.getLogger();
  logger.info("Looking for confirmed Tx");
  if (confirmed) {
    logger.info("Found Item!");
    const ActiveItem = Moralis.Object.extend("ActiveItem");

    const query = new Moralis.Query(ActiveItem);
    query.equalTo("marketplaceAddress", request.object.get("address"));
    query.equalTo("seller", request.object.get("seller"));
    query.equalTo("nftAddress", request.object.get("nftAddress"));
    query.equalTo("tokenId", request.object.get("tokenId"));
    const alreadyListedItem = await query.first();
    if (alreadyListedItem) {
      logger.info(`Deleting already listed: ${request.object.get("objectId")}`);
      await alreadyListedItem.destroy();
      logger.info(
        `Deleted tokenId: ${request.object.get(
          "tokenId"
        )} at address ${request.object.get(
          "nftAddress"
        )} since it's already been listed`
      );
    }

    const activeItem = new ActiveItem();
    activeItem.set("marketplaceAddress", request.object.get("address"));
    activeItem.set("seller", request.object.get("seller"));
    activeItem.set("nftAddress", request.object.get("nftAddress"));
    activeItem.set("tokenId", request.object.get("tokenId"));
    activeItem.set("price", request.object.get("price"));

    logger.info(
      `Adding Address ${request.object.get(
        "nftAddress"
      )}. TokenId: ${request.object.get("tokenId")}`
    );
    logger.info("Saving...");
    await activeItem.save();
  }
});

Moralis.Cloud.afterSave("ItemCanceled", async (request) => {
  const confirmed = request.object.get("confirmed");
  const logger = Moralis.Cloud.getLogger();
  logger.info(`Marketplace | Object: ${JSON.stringify(request.object)}`);
  if (confirmed) {
    const ActiveItem = Moralis.Object.extend("ActiveItem");
    const query = new Moralis.Query(ActiveItem);

    query.equalTo("marketplaceAddress", request.object.get("address"));
    query.equalTo("nftAddress", request.object.get("nftAddress"));
    query.equalTo("tokenId", request.object.get("tokenId"));
    logger.info(`Marketplace | Query: ${query}`);

    const canceledItem = await query.first();
    logger.info(`Marketplace | Canceled Item: ${JSON.stringify(canceledItem)}`);

    if (canceledItem) {
      logger.info(
        `Deleting TokenId ${request.object.get(
          "tokenId"
        )} at address ${request.object.get("nftAddress")}`
      );
      await canceledItem.destroy();
    } else {
      logger.info(
        `No item found with address: ${request.object.get(
          "nftAddress"
        )}, and TokenId: ${request.object.get("tokenId")}`
      );
    }
  }
});

Moralis.Cloud.afterSave("ItemBought", async (request) => {
  const confirmed = request.object.get("confirmed");
  const logger = Moralis.Cloud.getLogger();
  logger.info(`Makterplace | Object: ${JSON.stringify(request.object)}`);
  if (confirmed) {
    const ActiveItem = Moralis.Object.extend("ActiveItem");
    const query = new Moralis.Query(ActiveItem);

    query.equalTo("marketplaceAddress", request.object.get("address"));
    query.equalTo("nftAddress", request.object.get("nftAddress"));
    query.equalTo("tokenId", request.object.get("tokenId"));

    const boughtItem = await query.first();
    logger.info(`Marketplace | Bought Item: ${JSON.stringify(boughtItem)}`);
    if (boughtItem) {
      logger.info(
        `Deleting TokenId ${request.object.get(
          "tokenId"
        )} at address ${request.object.get("nftAddress")}`
      );
      await boughtItem.destroy();
    } else {
      logger.info(
        `No item found with address: ${request.object.get(
          "nftAddress"
        )}, and TokenId: ${request.object.get("tokenId")}`
      );
    }
  }
});
