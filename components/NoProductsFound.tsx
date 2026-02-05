import React from "react";

const NoProductsFound: React.FC = () => {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 min-h-[400px]">
      <div className="mb-6">
        <img
          src="/multifolks-logo-text.png"
          alt="Multifolks"
          className="h-16 w-auto object-contain"
        />
      </div>
      <h3 className="text-xl font-semibold text-[#333333]">
        Sorry! No Products Found
      </h3>
    </div>
  );
};

export default NoProductsFound;
