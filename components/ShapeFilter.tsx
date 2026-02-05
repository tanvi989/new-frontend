import React from "react";

interface ShapeFilterProps {
  selectedShapes: string[];
  onChange: (shape: string) => void;
}

const SHAPE_ICONS: { [key: string]: string } = {
  Aviator: "https://cdn.multifolks.com/shared/icons/Aviator.svg",
  Cateye: "https://cdn.multifolks.com/shared/icons/Cateye.svg",
  Hexagon: "https://cdn.multifolks.com/shared/icons/Hexagon.svg",
  Oval: "https://cdn.multifolks.com/shared/icons/Oval.svg",
  Rectangle: "https://cdn.multifolks.com/shared/icons/Rectangle.svg",
  Round: "https://cdn.multifolks.com/shared/icons/Round.svg",
  "Semi Square": "https://cdn.multifolks.com/shared/icons/SemiSquare.svg",
  Square: "https://cdn.multifolks.com/shared/icons/Square.svg",
  Wayfarer: "https://cdn.multifolks.com/shared/icons/Wayfarer.svg",
};

export const ShapeFilter: React.FC<ShapeFilterProps> = ({
  selectedShapes,
  onChange,
}) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      {Object.entries(SHAPE_ICONS).map(([shape, iconUrl]) => {
        const isSelected = selectedShapes.includes(shape);
        return (
          <div
            key={shape}
            onClick={() => onChange(shape)}
            className={`
                            cursor-pointer flex flex-col items-center justify-center p-2 border rounded-md transition-all
                            ${
                              isSelected
                                ? "border-black bg-gray-50"
                                : "border-gray-200 hover:border-gray-300"
                            }
                        `}
          >
            <img
              src={iconUrl}
              alt={shape}
              className="w-12 h-6 mb-2 object-contain"
            />
            <span className="text-[10px] text-gray-700 font-medium text-center leading-tight">
              {shape}
            </span>
          </div>
        );
      })}
    </div>
  );
};
