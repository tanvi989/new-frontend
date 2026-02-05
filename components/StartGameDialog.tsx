import React from "react";

interface StartGameDialogProps {
  open: boolean;
  onHide: () => void;
  order_id?: string;
  setStartGamePopup?: (val: boolean) => void;
}

const StartGameDialog: React.FC<StartGameDialogProps> = ({
  open,
  onHide,
  order_id,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 font-sans">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onHide}
      ></div>
      <div className="relative bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
        <h2 className="text-xl font-bold text-[#1F1F1F] mb-4">Start Game</h2>
        <p className="text-gray-500 mb-6">
          Order ID: {order_id}
          <br />
          Ready to play and win rewards?
        </p>
        <div className="flex gap-4">
          <button
            onClick={onHide}
            className="flex-1 py-3 border-2 border-[#232320] text-[#232320] font-bold rounded-lg uppercase text-xs tracking-wider hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onHide}
            className="flex-1 py-3 bg-[#232320] text-white font-bold rounded-lg uppercase text-xs tracking-wider hover:bg-black shadow-lg"
          >
            Play Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartGameDialog;
