import React, { useState } from 'react';

interface CoatingInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: string;
}

const CoatingInfoModal: React.FC<CoatingInfoModalProps> = ({ isOpen, onClose, initialTab = 'anti-reflective' }) => {
    const [activeTab, setActiveTab] = useState(initialTab);

    if (!isOpen) return null;

    const tabs = [
        { 
            id: 'anti-reflective', 
            label: 'Anti-Reflective',
            image: 'https://cdn.multifolks.com/msite/images/infograph-mob.png',
            description: 'Standard Anti-Reflective Coating reduces glare, reflections, and halos around lights at night, improving the vision and the appearance of your glasses.'
        },
        { 
            id: 'water-resistant', 
            label: 'Water-Resistant',
            image: 'https://cdn.multifolks.com/msite/images/infograph-water-resistant.png',
            description: 'Water-Resistant coating repels water droplets, ensuring clear vision even in rain or humid conditions. It makes cleaning easier and prevents water stains.'
        },
        { 
            id: 'oil-resistant', 
            label: 'Oil-Resistant',
            image: 'https://cdn.multifolks.com/msite/images/infograph-oil-resistant.png',
            description: 'Oil-Resistant (Oleophobic) coating repels fingerprints, oils, and smudges. It keeps your lenses cleaner for longer and makes them effortless to wipe clean.'
        }
    ];

    const coatingIcons = [
        {
            id: 'anti-reflective',
            image: 'https://cdn.multifolks.com/msite/images/anti-reflective-mob.png',
            label: 'Anti-Reflective'
        },
        {
            id: 'water-resistant',
            image: 'https://cdn.multifolks.com/msite/images/water-resistant-mob.png',
            label: 'Water-Resistant'
        },
        {
            id: 'oil-resistant',
            image: 'https://cdn.multifolks.com/msite/images/oil-resistant-mob.png',
            label: 'Oil-Resistant'
        }
    ];

    return (
        <div className="fixed inset-0 w-screen h-screen bg-black/50 z-[9999] flex items-center justify-center animate-in fade-in duration-200">
            <div
                className="bg-white w-screen h-screen max-w-screen max-h-screen overflow-y-auto relative animate-in zoom-in-95 duration-200 z-[10000]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-[10001]"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <div className="p-4 md:p-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-[#1F1F1F] mb-8 text-center font-serif">How to Choose a Coating</h2>

                    <div id="refcoat-innr" className="max-w-6xl mx-auto">
                        <div className="line_sec2">
                            <div className="main-inr-line">
                                {/* Tabs */}
                                <ul className="upper-list flex justify-center border-b border-gray-200 mb-4 md:mb-6">
                                    {tabs.map(tab => (
                                        <li 
                                            key={tab.id}
                                            className={`px-2 md:px-6 py-3 font-bold text-xs md:text-base transition-all cursor-pointer ${activeTab === tab.id ? 'active text-[#1F1F1F] border-b-2 border-[#1F1F1F]' : 'text-gray-400 hover:text-gray-600'}`}
                                            onClick={() => setActiveTab(tab.id)}
                                            data-target={tab.id}
                                            data-id={`img-${tab.id}`}
                                        >
                                            {tab.label}
                                        </li>
                                    ))}
                                </ul>
                                
                                {/* Dynamic Images */}
                                <div className="grl-image mb-4 md:mb-6">
                                    {tabs.map(tab => (
                                        <img 
                                            key={tab.id}
                                            className={`dynamic-image w-full max-w-4xl mx-auto ${activeTab === tab.id ? '' : 'hidden'}`}
                                            id={`img-${tab.id}`}
                                            src={tab.image} 
                                            alt={tab.label}
                                        />
                                    ))}
                                </div>
                                
                                {/* Description Text */}
                                <div className="text mt-2 md:mt-4 max-w-4xl mx-auto">
                                    <span className="hs_bold font-bold text-sm md:text-lg">Standard </span>
                                    <span className="text-xs md:text-base text-gray-600">
                                        {tabs.find(tab => tab.id === activeTab)?.description}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Icons Section - Always in One Row */}
                        <div className="icon_sec mt-8 md:mt-12">
                            <div className="inc-div mb-6 md:mb-8">
                                <h6 className="text-center font-bold text-red-600 uppercase tracking-wider text-sm md:text-base mb-6 md:mb-8">INCLUDED</h6>
                                <div className="row flex justify-between gap-2 md:gap-4">
                                    {coatingIcons.map(coating => (
                                        <div key={coating.id} className="flex-1">
                                            <div className="icon_wrapper text-center">
                                                <div className="icon_wrap mb-2 md:mb-4">
                                                    <img 
                                                        src={coating.image} 
                                                        alt={coating.label}
                                                        className="mx-auto h-10 md:h-16 lg:h-20 max-w-full"
                                                    />
                                                </div>
                                                <div className="text_wrap">
                                                    <p className="text-xs md:text-sm font-bold mb-1 md:mb-2">{coating.label}</p>
                                                    <div className={`tick2 ${activeTab === coating.id ? 'active' : ''}`} data-id={coating.id}>
                                                        <span className="d-flex flex justify-center">
                                                            <i className={`fa ${activeTab === coating.id ? 'fa-check' : 'fa-times'} text-lg md:text-2xl ${activeTab === coating.id ? 'text-green-500' : 'text-gray-300'}`}></i>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoatingInfoModal;