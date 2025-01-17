import React from "react";

import mintingAnimation from "assets/npcs/goblin_hammering.gif";

export const MintingBumpkin: React.FC = () => {
  return (
    <div className="flex flex-col items-center p-2">
      <span className="text-shadow text-center loading">Minting</span>
      <img src={mintingAnimation} className="w-1/2 mt-2 mb-3" />
      <span className="text-sm">
        Please be patient while we mint your Bumpkin NFT
      </span>
    </div>
  );
};
