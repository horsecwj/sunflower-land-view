import React, { useRef, useState } from "react";
import classNames from "classnames";

import { BuildingName } from "features/game/types/buildings";
import {
  BuildingProduct,
  PlacedItem as IBuilding,
} from "features/game/types/game";
import { FirePit } from "./FirePit";
import { TimeLeftOverlay } from "components/ui/TimeLeftOverlay";
import { Bar } from "components/ui/ProgressBar";
import { WithCraftingMachine } from "./WithCraftingMachine";

interface Prop {
  name: BuildingName;
  building: IBuilding;
  id: string;
}

export interface BuildingProps {
  buildingId: string;
  craftingState?: BuildingProduct;
}

const BUILDING_COMPONENTS: Record<BuildingName, React.FC<BuildingProps>> = {
  "Fire Pit": ({ buildingId, craftingState }: BuildingProps) => (
    <WithCraftingMachine buildingId={buildingId} craftingState={craftingState}>
      <FirePit buildingId={buildingId} />
    </WithCraftingMachine>
  ),
  Anvil: () => null,
  Bakery: () => null,
  Oven: () => null,
  Workbench: () => null,
};

export const Building: React.FC<Prop> = ({
  name,
  building,
  id: buildingId,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const BuildingPlaced = BUILDING_COMPONENTS[name];

  const inProgress = building.readyAt > Date.now();

  if (inProgress) {
    const totalSeconds = (building.readyAt - building.createdAt) / 1000;
    const secondsLeft = Math.floor((building.readyAt - Date.now()) / 1000);

    return (
      <>
        <div
          className="w-full h-full cursor-pointer"
          ref={overlayRef}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div
            className={classNames("w-full h-full pointer-events-none", {
              "opacity-50": inProgress,
            })}
          >
            <BuildingPlaced buildingId={buildingId} />
          </div>
          <div className="absolute bottom-0 w-8 left-1/2 -translate-x-1/2">
            <Bar percentage={(1 - secondsLeft / totalSeconds) * 100} />
          </div>
        </div>
        {overlayRef.current && (
          <TimeLeftOverlay
            target={overlayRef.current}
            timeLeft={secondsLeft}
            showTimeLeft={showTooltip}
          />
        )}
      </>
    );
  }

  return (
    <BuildingPlaced buildingId={buildingId} craftingState={building.crafting} />
  );
};
