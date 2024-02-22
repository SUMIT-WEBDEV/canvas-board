"use client";

import { useSelectionBounds } from "@/hooks/use-selection-bounds";
import { useMutation, useSelf } from "@/liveblocks.config";
import { Camera, Color } from "@/types/canvas";
import { memo } from "react";
import { ColorPicker } from "./color-picker";
import { useDeleteLayers } from "@/hooks/use-delete-layers";
import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { BringToFront, SendToBack, Trash2 } from "lucide-react";

interface SelectionToolProps {
  camera: Camera;
  setLastUsedColor: (color: Color) => void;
}

export const SelectionTools = memo(
  ({ camera, setLastUsedColor }: SelectionToolProps) => {
    const selection = useSelf((me) => me.presence.selection);
    const selectedLayerId = useSelf((me) => me.presence.selection[0]); // Access the first element

    console.log("Selection is", selection);

    const moveToFront = useMutation(
      ({ storage }) => {
        const liveLayerIds = storage.get("layerIds");
        const indices: number[] = [];

        const arr = liveLayerIds.toImmutable();

        for (let i = 0; i < arr.length; i++) {
          if (selection.includes(arr[i])) {
            indices.push(i);
          }
        }

        for (let i = indices.length - 1; i >= 0; i--) {
          liveLayerIds.move(
            indices[i],
            arr.length - 1 - (indices.length - 1 - i)
          );
        }
      },
      [selection]
    );

    const moveToBack = useMutation(
      ({ storage }) => {
        const liveLayerIds = storage.get("layerIds");
        const indices: number[] = [];

        const arr = liveLayerIds.toImmutable();

        for (let i = 0; i < arr.length; i++) {
          if (selection.includes(arr[i])) {
            indices.push(i);
          }
        }

        for (let i = 0; i < indices.length; i++) {
          liveLayerIds.move(indices[i], i);
        }
      },
      [selection]
    );

    // const moveToBack = useMutation(
    //   ({ storage }) => {
    //     // const selectedLayerId = useSelf((me) => me.presence.selection[0]); // Access the first element
    //     const liveLayerIds = storage.get("layerIds");

    //     if (!selectedLayerId) {
    //       return; // No selected layer, nothing to move
    //     }

    //     const index = liveLayerIds.indexOf(selectedLayerId);

    //     if (index === -1) {
    //       return; // Selected layer ID not found in the list of layer IDs
    //     }

    //     liveLayerIds.move(index, 0); // Move the selected layer to the beginning of the layer IDs list
    //   },
    //   [selectedLayerId]
    // );

    // const moveToFront = useMutation(
    //   ({ storage }) => {
    //     const liveLayerIds = storage.get("layerIds");

    //     if (!selectedLayerId) {
    //       return;
    //     }

    //     const index = liveLayerIds.indexOf(selectedLayerId);

    //     if (index === -1) {
    //       return;
    //     }

    //     liveLayerIds.move(index, liveLayerIds.length - 1);
    //   },
    //   [selectedLayerId]
    // );

    const setFill = useMutation(
      ({ storage }, fill: Color) => {
        const liveLayers = storage.get("layers");
        console.log("liveLayers", liveLayers);

        setLastUsedColor(fill);

        selection.forEach((id) => {
          liveLayers.get(id)?.set("fill", fill);
        });
      },
      [selection, setLastUsedColor]
    );

    const deleteLayers = useDeleteLayers();

    const selectionBounds = useSelectionBounds();

    if (!selectionBounds) {
      return null;
    }

    const x = selectionBounds.width / 2 + selectionBounds.x + camera.x;
    const y = selectionBounds.y + camera.y;

    return (
      <div
        className="absolute p-3 rounded-xl bg-white shadow-sm border flex select-none"
        style={{
          transform: `translate(calc(${x}px - 50%), calc(${y - 16}px - 100%))`,
        }}
      >
        <ColorPicker onChange={setFill} />

        <div className="flex flex-col gap-y-0.5">
          <Hint label="Bring to front">
            <Button variant="board" size="icon" onClick={moveToFront}>
              <BringToFront />
            </Button>
          </Hint>
          <Hint label="Send to Back" side="bottom">
            <Button variant="board" size="icon" onClick={moveToBack}>
              <SendToBack />
            </Button>
          </Hint>
        </div>

        <div className="flex items-center pl-2 ml-2 border-l border-neutral-200">
          <Hint label="Delete">
            <Button variant="board" size="icon" onClick={deleteLayers}>
              <Trash2 />
            </Button>
          </Hint>
        </div>
      </div>
    );
  }
);


SelectionTools.displayName = 'SelectionTools';