import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Glasses } from 'lucide-react';

export const GenderFilter: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isMen = location.pathname.includes('/men');
    const isWomen = location.pathname.includes('/women');
    const isAll = location.pathname === '/glasses';
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="border-b border-gray-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-4 flex items-center justify-between text-left focus:outline-none group"
            >
                <span className="text-xs font-bold text-[#1F1F1F] uppercase tracking-wider transition-colors">Shop For</span>
                <span className={`transform transition-transform duration-200 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor"><path d="M1 1L5 5L9 1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/glasses')}
                        className={`flex-1 border rounded-lg p-3 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${isAll
                            ? 'border-[#1F1F1F] bg-[#F9F9F9] text-[#1F1F1F] shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        <svg width="32" height="19" viewBox="0 0 46 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M46 2.09996C42.18 2.31792 39.0943 0.035123 34.8499 0.000709066C32.6244 -0.0222336 30.0893 0.505447 26.9576 2.47851C26.0399 1.60669 19.9601 1.60669 19.0424 2.47851C15.9107 0.505447 13.3756 -0.0222336 11.1501 0.000709066C6.90574 0.035123 3.80848 2.31792 0 2.09996V5.95433C1.53716 6.00021 1.8813 6.18375 2.01895 7.26206C3.98055 22.1518 20.7057 18.9284 20.809 6.47053C17.012 2.89148 28.9651 2.89148 25.1796 6.47053C25.2828 18.9284 42.008 22.1404 43.9696 7.26206C44.1187 6.17228 44.4514 6.00021 45.9885 5.95433V2.09996H46ZM1.35362 3.88949C1.5601 3.88949 1.73217 4.06156 1.73217 4.26804C1.73217 4.47452 1.5601 4.64659 1.35362 4.64659C1.14713 4.64659 0.975062 4.47452 0.975062 4.26804C0.975062 4.06156 1.14713 3.88949 1.35362 3.88949ZM44.6349 3.88949C44.4284 3.88949 44.2564 4.06156 44.2564 4.26804C44.2564 4.47452 44.4284 4.64659 44.6349 4.64659C44.8414 4.64659 45.0135 4.47452 45.0135 4.26804C45.0135 4.06156 44.8414 3.88949 44.6349 3.88949ZM34.6549 1.27403C38.8878 1.27403 42.3177 3.44211 42.3177 7.48001C42.3177 11.5179 38.8878 15.9458 34.6549 15.9458C32.2459 15.9458 29.9057 14.6611 28.5062 12.6765C27.4394 11.1738 26.992 9.22365 26.992 7.48001C26.992 3.44211 30.4219 1.27403 34.6549 1.27403ZM11.3337 1.27403C7.10075 1.27403 3.67082 3.44211 3.67082 7.48001C3.67082 11.5179 7.10075 15.9458 11.3337 15.9458C13.7426 15.9458 16.0828 14.6611 17.4823 12.6765C18.5491 11.1738 18.9965 9.22365 18.9965 7.48001C18.9965 3.44211 15.5666 1.27403 11.3337 1.27403Z" fill="currentColor"></path>
                        </svg>
                        <span className="text-[11px] font-bold uppercase tracking-wide">All</span>
                    </button>
                    <button
                        onClick={() => navigate('/glasses/men')}
                        className={`flex-1 border rounded-lg p-3 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${isMen
                            ? 'border-[#1F1F1F] bg-[#F9F9F9] text-[#1F1F1F] shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        <img src="/Men.svg" alt="Men" width="32" height="32" />
                        <span className="text-[11px] font-bold uppercase tracking-wide">Men</span>
                    </button>

                    <button
                        onClick={() => navigate('/glasses/women')}
                        className={`flex-1 border rounded-lg p-3 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${isWomen
                            ? 'border-[#1F1F1F] bg-[#F9F9F9] text-[#1F1F1F] shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        <img src="/Women.svg" alt="Women" width="32" height="32" />
                        <span className="text-[11px] font-bold uppercase tracking-wide">Women</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
