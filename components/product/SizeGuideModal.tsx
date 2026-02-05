import React from 'react';

interface SizeGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95 duration-200">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <div className="p-8 md:p-12">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-serif text-[#1F1F1F] mb-4">Your Guide To Perfect Frame Size</h2>
                        <p className="text-lg text-gray-600 font-medium mb-2">Want to know the magic portion to a great fitting pair?</p>
                        <p className="text-2xl font-serif text-[#1F1F1F] italic mb-6">It's your frame size</p>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Here's a Guide that'll give you the quickest & easiest route to your best-fitting frames.
                        </p>
                    </div>

                    {/* Key Note */}
                    <div className="bg-[#F9F9F9] p-6 rounded-xl mb-12 border border-gray-100">
                        <p className="text-sm text-gray-600 leading-relaxed">
                            <span className="font-bold text-[#1F1F1F]">Key Note:</span> At MultiFolks, most of our collections fall under Medium Size Category. This is because our frames are designed keeping in mind an ideal Indian face. In case you're not sure of your frame size, you can always try buying a medium frame that fits most of the people. However, if you want to be 100% sure, follow any of the ways below to get to that perfect fit.
                        </p>
                    </div>

                    {/* Methods */}
                    <div className="space-y-16">

                        {/* Method 1 */}
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-[#1F1F1F] mb-4">1. Using Size Of Your Current Frames</h3>
                                <p className="text-gray-600 mb-4">
                                    If you own a well-fitted pair already, try and peek at the insides of the temples to find out the measurements. It would look like a set of numbers which denote lens width, bridge width & temple length respectively. e.g. 52-15-145
                                </p>
                                <div className="bg-gray-50 p-4 rounded-lg inline-block">
                                    <div className="flex gap-8 text-center">
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Lens Width</div>
                                            <div className="font-bold text-[#1F1F1F]">52</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Bridge Width</div>
                                            <div className="font-bold text-[#1F1F1F]">15</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Temple Length</div>
                                            <div className="font-bold text-[#1F1F1F]">145</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1">
                                {/* Placeholder for Frame Diagram */}
                                <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                                    [Frame Diagram Image]
                                </div>
                            </div>
                        </div>

                        {/* Method 2 */}
                        <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-[#1F1F1F] mb-4">2. Using A Ruler</h3>
                                <p className="text-gray-600 mb-4">
                                    In case your frames are older than a year, you might find the numbers faded. This gives doubt a chance and you may end up buying a wrong size.
                                </p>
                                <p className="text-gray-600 mb-4">
                                    So let's have a look at the next simplest way. For this, you will need:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-gray-600 mb-4">
                                    <li>A Millimeter Ruler / Cloth Measuring Tape</li>
                                    <li>Pen/Pencil to Record the Readings</li>
                                </ul>
                            </div>
                            <div className="flex-1">
                                {/* Placeholder for Ruler Image */}
                                <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                                    [Ruler Measurement Image]
                                </div>
                            </div>
                        </div>

                        {/* Method 3 */}
                        <div>
                            <h3 className="text-xl font-bold text-[#1F1F1F] mb-6">3. Using A Clothing Size Guide</h3>
                            <p className="text-gray-600 mb-8">
                                You'd wonder how a clothing guide can help you. But broadly, your regular T-shirt can help you solve this mystery like a pro. Here's how -
                            </p>

                            <div className="grid md:grid-cols-3 gap-6 mb-12">
                                <div className="bg-gray-50 p-6 rounded-xl">
                                    <div className="font-bold text-[#1F1F1F] mb-2">Small (S)</div>
                                    <p className="text-sm text-gray-600">Frames with less than or equal to 50mm of lens-width would fit you easily.</p>
                                </div>
                                <div className="bg-gray-50 p-6 rounded-xl">
                                    <div className="font-bold text-[#1F1F1F] mb-2">Medium (M)</div>
                                    <p className="text-sm text-gray-600">Go for frames between 51mm to 54mm of lens-width.</p>
                                </div>
                                <div className="bg-gray-50 p-6 rounded-xl">
                                    <div className="font-bold text-[#1F1F1F] mb-2">Large (L)</div>
                                    <p className="text-sm text-gray-600">Spectacles must be 55mm wide or more.</p>
                                </div>
                            </div>

                            <h4 className="font-bold text-[#1F1F1F] mb-4">Eyeglasses Size Chart</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                        <tr>
                                            <th className="px-6 py-3">Small</th>
                                            <th className="px-6 py-3">Medium</th>
                                            <th className="px-6 py-3">Large</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        <tr>
                                            <td className="px-6 py-4">50mm or less</td>
                                            <td className="px-6 py-4">51mm - 54mm</td>
                                            <td className="px-6 py-4">55mm or more</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Method 4 */}
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-[#1F1F1F] mb-4">4. Using Debit/Credit Card</h3>
                                <p className="text-gray-600 mb-4">
                                    Did you know you could find out your frame size with your debit/credit cards too?
                                </p>
                                <p className="text-gray-600 mb-4">
                                    Interestingly, the standard width of the card can be compared to a medium (M) sized frame.
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                                    <li>Place one edge of the card at the center of your nose.</li>
                                    <li>If the other end ends at the tip of your eye: Medium size fits right.</li>
                                    <li>If it extends beyond the eye: Small size is what you need.</li>
                                    <li>If it ends before the eye: You need a Large size.</li>
                                </ul>
                            </div>
                            <div className="flex-1">
                                {/* Placeholder for Card Image */}
                                <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                                    [Credit Card Measurement Image]
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default SizeGuideModal;
