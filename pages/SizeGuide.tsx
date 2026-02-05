import React, { useEffect } from 'react';

const SizeGuide: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white pt-24 pb-16">
            <div className="container mx-auto px-4 max-w-4xl">

                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif text-[#1F1F1F] mb-6">Your Guide To Perfect Frame Size</h1>
                    <p className="text-xl text-gray-600 font-medium mb-3">Want to know the magic portion to a great fitting pair?</p>
                    <p className="text-3xl font-serif text-[#1F1F1F] italic mb-8">It's your frame size</p>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        Here's a Guide that'll give you the quickest & easiest route to your best-fitting frames.
                    </p>
                </div>

                {/* Key Note */}
                <div className="bg-[#F9F9F9] p-8 rounded-2xl mb-16 border border-gray-100 shadow-sm">
                    <p className="text-base text-gray-600 leading-relaxed">
                        <span className="font-bold text-[#1F1F1F]">Key Note:</span> At MultiFolks, most of our collections fall under Medium Size Category. This is because our frames are designed keeping in mind an ideal Indian face. In case you're not sure of your frame size, you can always try buying a medium frame that fits most of the people. However, if you want to be 100% sure, follow any of the ways below to get to that perfect fit.
                    </p>
                </div>

                {/* Methods */}
                <div className="space-y-20">

                    {/* Method 1 */}
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-[#1F1F1F] mb-6">1. Using Size Of Your Current Frames</h3>
                            <p className="text-gray-600 mb-6 text-lg">
                                If you own a well-fitted pair already, try and peek at the insides of the temples to find out the measurements. It would look like a set of numbers which denote lens width, bridge width & temple length respectively. e.g. 52-15-145
                            </p>
                            <div className="bg-gray-50 p-6 rounded-xl inline-block border border-gray-100">
                                <div className="flex gap-10 text-center">
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Lens Width</div>
                                        <div className="font-bold text-[#1F1F1F] text-xl">52</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Bridge Width</div>
                                        <div className="font-bold text-[#1F1F1F] text-xl">15</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Temple Length</div>
                                        <div className="font-bold text-[#1F1F1F] text-xl">145</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 w-full">
                            <div className="aspect-video bg-white rounded-2xl flex items-center justify-center">
                                <img src="size-eyeglass.jpg" alt="" />
                            </div>
                        </div>
                    </div>

                    {/* Method 2 */}
                    <div className="flex flex-col md:flex-row-reverse gap-12 items-center">
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-[#1F1F1F] mb-6">2. Using A Ruler</h3>
                            <p className="text-gray-600 mb-4 text-lg">
                                In case your frames are older than a year, you might find the numbers faded. This gives doubt a chance and you may end up buying a wrong size.
                            </p>
                            <p className="text-gray-600 mb-6 text-lg">
                                So let's have a look at the next simplest way. For this, you will need:
                            </p>
                            <ul className="list-disc pl-6 space-y-3 text-gray-600 text-lg">
                                <li>A Millimeter Ruler / Cloth Measuring Tape</li>
                                <li>Pen/Pencil to Record the Readings</li>
                            </ul>
                        </div>
                        <div className="flex-1 w-full">
                            <div className="aspect-video rounded-2xl flex items-center justify-center">
                                <img src="size-ruler.jpg" alt="" />
                            </div>
                        </div>
                    </div>

                    {/* Method 3 */}
                    <div>
                        <h3 className="text-2xl font-bold text-[#1F1F1F] mb-8">3. Using A Clothing Size Guide</h3>
                        <p className="text-gray-600 mb-10 text-lg">
                            You'd wonder how a clothing guide can help you. But broadly, your regular T-shirt can help you solve this mystery like a pro. Here's how -
                        </p>

                        <div className="grid md:grid-cols-3 gap-8 mb-16">
                            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="font-bold text-[#1F1F1F] text-xl mb-3">Small (S)</div>
                                <p className="text-gray-600">Frames with less than or equal to 50mm of lens-width would fit you easily.</p>
                            </div>
                            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="font-bold text-[#1F1F1F] text-xl mb-3">Medium (M)</div>
                                <p className="text-gray-600">Go for frames between 51mm to 54mm of lens-width.</p>
                            </div>
                            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="font-bold text-[#1F1F1F] text-xl mb-3">Large (L)</div>
                                <p className="text-gray-600">Spectacles must be 55mm wide or more.</p>
                            </div>
                        </div>

                        <h4 className="font-bold text-[#1F1F1F] text-xl mb-6">Eyeglasses Size Chart</h4>
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-sm uppercase text-gray-500 tracking-wider">
                                    <tr>
                                        <th className="px-8 py-4 font-semibold">Small</th>
                                        <th className="px-8 py-4 font-semibold">Medium</th>
                                        <th className="px-8 py-4 font-semibold">Large</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    <tr>
                                        <td className="px-8 py-6 text-gray-700 font-medium">50mm or less</td>
                                        <td className="px-8 py-6 text-gray-700 font-medium">51mm - 54mm</td>
                                        <td className="px-8 py-6 text-gray-700 font-medium">55mm or more</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Method 4 */}
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-[#1F1F1F] mb-6">4. Using Debit/Credit Card</h3>
                            <p className="text-gray-600 mb-6 text-lg">
                                Did you know you could find out your frame size with your debit/credit cards too? Interestingly, the standard width of the card can be compared to a medium (M) sized frame.
                            </p>
                            <ul className="list-disc pl-6 space-y-3 text-gray-600 text-lg">
                                <li>Place one edge of the card at the center of your nose.</li>
                                <li>If the other end ends at the tip of your eye: Medium size fits right.</li>
                                <li>If it extends beyond the eye: Small size is what you need.</li>
                                <li>If it ends before the eye: You need a Large size.</li>
                            </ul>
                        </div>
                        <div className="flex-1 w-full">
                            <div className="aspect-video rounded-2xl flex items-center justify-center">
                                <img src="size-guide.jpg" alt="" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SizeGuide;
