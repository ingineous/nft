import React, { useEffect, useState } from "react";
import {
  useAddress,
  useDisconnect,
  useMetamask,
  useNFTDrop,
} from "@thirdweb-dev/react";
import { GetServerSideProps } from "next";
import { sanityClient, urlfor } from "../../sanity";
import { Collection } from "../../typings";
import Link from "next/link";
import styled from "styled-components";
import { Gradient } from "../../components/Gradient";
import Button from "../../components/Button";
import { BigNumber } from "ethers";
import { toast, Toaster } from "react-hot-toast";
import Modal from "react-modal";
import { NFTMetadataOwner } from "@thirdweb-dev/sdk";

interface Props {
  collection: Collection;
}

const Container = styled.div`
  height: 100vh;
  overflow-y: scroll;
  width: 100%;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(50px);

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    border-radius: 8px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
  }

  .fit-content {
    height: fit-content;
  }

  .width-content {
    width: fit-content;
  }

  .animate-bottom {
    position: relative;
    top: 48px;
    transition: all 0.2s ease-in;

    :hover {
      top: 32px;
    }
  }

  .animate {
    position: relative;
    top: 0;

    transition: all 0.2s ease-in;

    :hover {
      top: -16px;
    }
  }

  .gradient-text {
    background: linear-gradient(
      90deg,
      hsl(240deg 95% 92%) 0%,
      hsl(273deg 100% 91%) 12%,
      hsl(302deg 100% 89%) 22%,
      hsl(317deg 100% 87%) 30%,
      hsl(336deg 100% 85%) 38%,
      hsl(360deg 100% 85%) 45%,
      hsl(21deg 100% 77%) 54%,
      hsl(35deg 100% 70%) 64%,
      hsl(44deg 100% 62%) 78%,
      hsl(55deg 86% 51%) 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const GradientCanvas = styled.canvas`
  width: 100%;
  height: 100vh;
  --gradient-color-1: #1b7b14;
  --gradient-color-2: #ce1c69;
  --gradient-color-3: #000000;
  --gradient-color-4: #212673;
  z-index: -1;
  position: absolute;
  top: 0;
  left: 0;
`;

function Home({ collection }: Props) {
  const [claimedSupply, setClaimedSupply] = useState<number>(0);
  const [totalSupply, setTotalSupply] = useState<BigNumber>();
  const [loading, setLoading] = useState<boolean>(true);
  const [priceInEth, setPriceInEth] = useState<string>("");
  const [modal, setModal] = useState<boolean>(false);
  const [metadata, setMetadata] = useState<null | NFTMetadataOwner>(null);

  const nftDrop = useNFTDrop(collection.address);

  useEffect(() => {
    if (!nftDrop) return;

    const fetchPrice = async () => {
      setLoading(true);

      const claimedConditions = await nftDrop.claimConditions.getAll();
      setPriceInEth(claimedConditions?.[0].currencyMetadata.displayValue);

      setLoading(false);
    };

    fetchPrice();
  }, [nftDrop]);

  useEffect(() => {
    if (!nftDrop) return;

    const fetchNFTDropData = async () => {
      setLoading(true);

      const claimed = await nftDrop.getAllClaimed();
      const total = await nftDrop.totalSupply();

      setClaimedSupply(claimed.length);
      setTotalSupply(total);

      setLoading(false);
    };

    fetchNFTDropData();
  }, []);

  const mintNft = async () => {
    if (!nftDrop || !address) return;

    const quantity = 1;

    setLoading(true);

    const notification = toast.loading("Minting...", {
      style: {
        background: "black",
        color: "green",
        fontWeight: "bolder",
        fontSize: "17px",
        padding: "20px",
      },
    });

    try {
      const tx = await nftDrop?.claimTo(address, quantity);

      const receipt = tx[0].receipt;
      const claimedTokenId = tx[0].id;
      const claimedNFT = await tx[0].data();

      setMetadata(claimedNFT);
      console.log("rec", receipt);
      console.log("tok", claimedTokenId);
      console.log("nft", claimedNFT);

      const fetchNFTDropData = async () => {
        setLoading(true);

        const claimed = await nftDrop.getAllClaimed();
        const total = await nftDrop.totalSupply();

        setClaimedSupply(claimed.length);
        setTotalSupply(total);

        setLoading(false);
      };

      await fetchNFTDropData();

      toast("Hurray, You successfully minted.", {
        duration: 8000,
        style: {
          background: "green",
          color: "white",
          fontWeight: "bolder",
          fontSize: "17px",
          padding: "20px",
        },
      });

      setModal(true);
    } catch (e) {
      console.log(e);
      toast("Whoops, Something went wrong :(", {
        duration: 8000,
        style: {
          background: "red",
          color: "white",
          fontWeight: "bolder",
          fontSize: "17px",
          padding: "20px",
        },
      });
    } finally {
      setLoading(false);
      toast.dismiss(notification);
    }
  };

  const connectWithMetamask = useMetamask();
  const address = useAddress();
  const disconnect = useDisconnect();

  useEffect(() => {
    const gradient = new Gradient();

    // @ts-ignore
    gradient.initGradient("#gradient-canvas-id");
  }, []);

  return (
    <div>
      <GradientCanvas data-transition-in id={"gradient-canvas-id"} />

      <Toaster position={"bottom-right"} />

      <Modal
        isOpen={modal}
        onRequestClose={() => setModal(false)}
        style={{
          overlay: {
            backdropFilter: "blur(12px)",
            background: "rgba(255, 255, 255, 0.1)",
          },
          content: {
            backdropFilter: "blur(12px)",
            background: "rgba(255, 255, 255, 0.4)",
            border: "none",
          },
        }}
      >
        <div
          className={
            "grid grid-cols-10 overflow-y-scroll h-full scrollbar relative p-10"
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 absolute top-3 right-3 cursor-pointer"
            onClick={() => setModal(false)}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>

          <img
            className={"col-span-3 h-78 flex w-full rounded-3xl object-cover"}
            src={metadata?.metadata?.image}
            alt=""
          />

          <div className={"col-span-7 flex flex-col px-32 space-y-6"}>
            <div className={"space-y-3"}>
              <p className={"text-3xl font-extrabold px-3"}>Name</p>
              <p className={"bg-gray-300 p-3 rounded-xl text-gray-500"}>
                {metadata?.metadata?.name}
              </p>
            </div>{" "}
            <div className={"space-y-3"}>
              <p className={"text-3xl font-extrabold px-3"}>Description</p>
              <p className={"bg-gray-300 p-3 rounded-xl text-gray-500"}>
                {metadata?.metadata?.description}
              </p>
            </div>{" "}
            <div className={"space-y-3"}>
              <p className={"text-3xl font-extrabold px-3"}>URI</p>
              <p className={"bg-gray-300 p-3 rounded-xl text-gray-500"}>
                {metadata?.metadata?.uri}
              </p>
            </div>{" "}
          </div>
        </div>
      </Modal>

      <Container className={" p-32 pt-16"}>
        <header
          className={"text-white flex justify-between items-center mb-16"}
        >
          <p className={"text-xl font-medium"}>
            The{" "}
            <Link href={"/"}>
              <span
                className={
                  "font-bold underline decoration-white cursor-pointer"
                }
              >
                POG
              </span>
            </Link>{" "}
            Apes
          </p>

          {address && (
            <p>
              You&apos;re logged in with wallet{" "}
              {`${address.substring(0, 5)}...${address.substring(
                address.length - 5
              )}`}
            </p>
          )}

          <button
            onClick={address ? disconnect : connectWithMetamask}
            className={
              "text-sm font-bold px-4 flex items-center py-2 rounded-full bg-gray-400 hover:drop-shadow-3xl"
            }
          >
            {!address ? (
              <>
                Connect wallet&nbsp;&nbsp;
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </>
            ) : (
              <>
                Disconnect&nbsp;&nbsp;
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </>
            )}
          </button>
        </header>

        <div className={"grid grid-cols-10"}>
          <div className={"flex flex-col col-span-6"}>
            <h1 className={"text-white text-8xl font-extrabold gradient-text"}>
              {collection.title}
            </h1>

            <div className={"width-content"}>
              <h3
                className={
                  "text-white font-bold text-3xl underline decoration-white mt-12 mb-4"
                }
              >
                {collection.nftCollectionName}
              </h3>

              <p className={"mb-6 text-gray-300 text-xl"}>
                {collection.description}
              </p>

              {!loading && (
                <p className={"text-white font-medium text-xl gradient-text"}>
                  {claimedSupply}/{totalSupply?.toString()} NFT&apos;s owned.
                </p>
              )}

              {loading && (
                <img
                  className={"h-24 w-24 mt-8 mx-auto object-contain"}
                  src="/loading-custom.gif"
                  alt=""
                />
              )}

              <Button
                onClick={mintNft}
                disabled={
                  loading ||
                  claimedSupply === totalSupply?.toNumber() ||
                  !address
                }
              >
                {loading
                  ? "Loading..."
                  : claimedSupply === totalSupply?.toNumber()
                  ? "Sold Out"
                  : !address
                  ? "Sign in to Mint"
                  : `Mint NFT (${priceInEth} ETH)`}
              </Button>
            </div>
          </div>

          <div className={"flex flex-col col-span-4"}>
            <div className={"flex space-x-6"}>
              <div
                className={
                  "text-white fit-content p-10 text-center bg-white/10 backdrop-blur-md fit-content rounded-xl animate"
                }
              >
                <img
                  className={"h-72 object-cover w-56 rounded-xl"}
                  src={urlfor(collection.previewImage).url()}
                  alt=""
                />
              </div>
              <div
                className={
                  "text-white fit-content p-10 text-center bg-white/10 backdrop-blur-md fit-content rounded-xl animate-bottom"
                }
              >
                <img
                  className={"h-72 object-cover w-56 rounded-xl"}
                  src={urlfor(collection.mainImage).url()}
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default Home;

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const query = `
    *[_type =="collection" && slug.current == $id][0]{
  _id,
  title,
  address,
  description,
  nftCollectionName,
  mainImage {
    asset,
  },
  previewImage {
    asset,
  },
  slug {
    current,
  },
  creator -> {
    _id,
    name,
    address,
    slug {
      current
    },
  },
}
  `;

  const collection = await sanityClient.fetch(query, {
    id: params?.id,
  });

  if (!collection) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      collection: collection,
    },
  };
};
