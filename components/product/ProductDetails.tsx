
import React, { useEffect, useState } from 'react';
import EpmPrescriptionsPopup from './EpmPrescriptionsPopup';
import UploadPrescriptionspopup from './UploadPrescriptionspopup';
import PowerTypeDialog from './PowerTypeDialog';
import { addLensDiscount, getProductDetails, removeDiscount, removePrescription } from '../../api/retailerApis';
import { Loader } from '../Loader';
import SignUpModal from '../SignUpModal';
import { CartItem } from '../../types';
import { getHexColorsFromNames } from '../../utils/colorNameToHex';

interface ProductDetailsProps {
  selectedProduct: any;
  selectedColor: string;
  selectedLens: any;
  selectedSize: string;
  setSelectedColor: (color: string) => void;
  setSelectedSize: (size: string) => void;
  selectedCart: CartItem;
  state: any;
  refetch: () => void;
  prescription: any;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  selectedProduct,
  selectedColor,
  selectedLens,
  selectedSize,
  setSelectedColor,
  setSelectedSize,
  selectedCart,
  state,
  refetch,
  prescription
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openUploadDialog, setUploadOpenDialog] = useState(false);
  const [openLensDialog, setLensDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState<any>({});
  const [lensDiscount, setLensDiscount] = useState<string>('0');
  const [openSignUpModal, setOpenSignUpModal] = useState(false);
  const [mode, setMode] = useState('');
  const [activeImage, setActiveImage] = useState<string>('');

  useEffect(() => {
    if (selectedProduct && selectedColor && selectedSize) {
      const getData = async () => {
        setIsLoading(true);
        try {
          const response: any = await getProductDetails(selectedProduct?.skuid, selectedColor, selectedSize);
          if (response?.data?.status) {
            const p = response?.data;
            setProduct(p);

            // Set active image
            const images = p.images || (p.image ? [p.image] : []);
            if (images.length > 0) setActiveImage(images[0]);

            refetch();
          }
        } catch (error) {
          console.error("Failed to fetch product details", error);
        } finally {
          setIsLoading(false);
        }
      }
      getData();
    }
  }, [selectedProduct?.skuid, selectedColor, selectedLens?.id, selectedSize]);

  const handleUpload = (open = false, mode: string) => {
    if (state?.from !== 'checkup' && !open && !prescription) {
      setMode(mode);
      setOpenSignUpModal(true);
    } else {
      mode === 'manual' ? setOpenDialog(true) : setUploadOpenDialog(true);
    }
  }

  const handleSelectLens = () => {
    setLensDialog(false);
  }

  const handleRemovePrescription = () => {
    removePrescription(selectedCart?.cart_id).then((response: any) => {
      if (response?.data?.status) {
        refetch();
      }
    })
  }

  const handleAddLensDiscount = () => {
    addLensDiscount({ retailer_lens_discount: parseFloat(lensDiscount), cart_id: selectedCart?.cart_id }).then((response: any) => {
      if (response?.data?.status) {
        refetch();
      }
    })
  }

  const handleRemoveDiscount = () => {
    removeDiscount({ cart_id: selectedCart?.cart_id, retailer_lens_discount: true }).then((response: any) => {
      if (response?.data?.status) {
        refetch();
      }
    })
  }

  if (isLoading) {
    return (
      <div className="w-full lg:w-1/2 p-6">
        <div className="bg-white rounded-xl shadow-[0px_4px_30px_0px_rgba(0,0,0,0.05)] p-8 min-h-[400px] flex items-center justify-center">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-1/2 p-6 font-sans">
      <div className="bg-white rounded-xl shadow-[0px_4px_30px_0px_rgba(0,0,0,0.05)] p-8 w-full">
        <div className="flex flex-col items-center w-full">
          <div className="flex justify-center mb-6 w-full">
            <img
              src={activeImage || product?.image || "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=600"}
              alt='Product'
              className="max-w-full h-auto max-h-[300px] object-contain mix-blend-multiply"
            />
          </div>

          {/* Thumbnails */}
          {product?.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto py-2 px-2 w-full justify-center mb-6">
              {product.images.slice(0, 4).map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-16 h-16 border rounded-lg overflow-hidden flex-shrink-0 transition-all ${activeImage === img ? 'border-[#232320]' : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-contain mix-blend-multiply" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info Start */}
        <div className="flex justify-between items-start gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#525252] font-serif">{product?.product?.naming_system || product?.product?.brand}</h2>
            <p className="text-sm text-[#525252] mt-1 font-medium">
              {product?.product?.framecolor && product?.product?.framecolor[0]?.toUpperCase() + product?.product?.framecolor.slice(1)} {product?.product?.style} For {product?.product?.gender}
            </p>
          </div>
          <div className="text-right">
            <h4 className="text-xl font-bold text-[#4596F3]">
              ₹{product?.product?.list_price}.00
              <span className="text-[#4596F3] line-through text-sm ml-2 opacity-70">
                ₹{product?.product?.price}.00
              </span>
            </h4>
          </div>
        </div>

        <div className="w-full h-px bg-gray-100 my-4"></div>

        {/* Product Size Start */}
        <h2 className="text-base font-bold text-[#525252] mb-3">Size</h2>
        <ul className="flex gap-3 mb-4">
          {product?.sizes?.map((size: string) => (
            <li
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`w-10 h-10 rounded-full border flex items-center justify-center cursor-pointer transition-all font-bold text-sm
                    ${product?.product?.size === size
                  ? 'border-[#232320] bg-[#232320] text-white'
                  : 'border-gray-200 text-[#525252] hover:border-gray-300'}`}
            >
              {size[0]}
            </li>
          ))}
        </ul>

        <div className="w-full h-px bg-gray-100 my-4"></div>

        {/* Product Color Start */}
        <h2 className="text-base font-bold text-[#525252] mb-3">Colors</h2>
        <ul className="flex flex-wrap gap-3 mb-4">
          {product?.colors?.map((colorItem: any, idx: number) => {
            const isString = typeof colorItem === 'string';
            const colorName = isString ? colorItem : colorItem.frameColor;
            const colorHex = getHexColorsFromNames([colorName])[0] || colorName;

            return (
              <li
                key={idx}
                onClick={() => setSelectedColor(colorName)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-all text-xs font-bold uppercase
                    ${selectedColor === colorName
                    ? 'border-[#232320] bg-[#F3F0E7] text-[#232320]'
                    : 'border-gray-200 text-[#525252] hover:bg-gray-50'}`}
              >
                <span
                  className="w-3 h-3 rounded-full border border-gray-200"
                  style={{ backgroundColor: colorHex }}
                ></span>
                {colorName}
              </li>
            )
          })}
        </ul>

        <div className="w-full h-px bg-gray-100 my-4"></div>

        {/* Lens Power Type */}
        <h2 className="text-base font-bold text-[#525252] mb-3">Lens power type</h2>
        {!selectedLens ? (
          <button
            onClick={() => setLensDialog(true)}
            disabled={selectedCart?.flag === 'instant'}
            className={`text-sm font-bold text-[#4596F3] underline decoration-[#4596F3] hover:text-[#2B7DCD] transition-colors ${selectedCart?.flag === 'instant' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Select Lens power type
          </button>
        ) : (
          <>
            <div className="bg-[#F9FAFB] p-3 rounded-lg border border-gray-100 flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-full border border-gray-200 flex items-center justify-center text-gray-500">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M2 12h20"></path>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Lens</p>
                  <p className="text-sm font-bold text-[#1F1F1F]">{selectedLens?.sub_category}</p>
                </div>
              </div>
              <button
                onClick={() => setLensDialog(true)}
                className="text-xs font-bold text-[#4596F3] hover:underline"
              >
                Change
              </button>
            </div>

            <div className="mb-4">
              {!selectedCart?.retailer_lens_discount || selectedCart?.retailer_lens_discount === 0 ? (
                <div className="flex gap-2">
                  <input
                    value={lensDiscount}
                    onChange={({ target: { value } }) => setLensDiscount(value)}
                    type='number'
                    placeholder='Enter Discount'
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#232320]"
                  />
                  <button
                    onClick={handleAddLensDiscount}
                    className="bg-[#232320] text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
                  >
                    Apply
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-600 font-bold">₹{selectedCart?.retailer_lens_discount?.toFixed(2)} Discount Added</span>
                  <button onClick={handleRemoveDiscount} className="text-[#E94D37] text-xs font-bold underline ml-2">Remove</button>
                </div>
              )}
            </div>
          </>
        )}

        <div className="w-full h-px bg-gray-100 my-4"></div>

        {/* Prescriptions */}
        <h2 className="text-base font-bold text-[#525252] mb-3">Prescriptions</h2>
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${selectedCart?.flag === 'instant' || !selectedCart?.lens ? 'opacity-50 pointer-events-none' : ''}`}>
          {/* Manual Entry */}
          <button
            onClick={() => handleUpload(false, "manual")}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2
                    ${selectedCart?.prescription_mode === 'manual'
                ? 'border-[#232320] bg-[#F3F0E7] text-[#232320]'
                : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span className="text-xs font-bold uppercase text-center">Enter Manually</span>
          </button>

          {/* Upload */}
          <button
            onClick={() => handleUpload(false, "upload")}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2
                    ${selectedCart?.prescription_mode === 'upload'
                ? 'border-[#232320] bg-[#F3F0E7] text-[#232320]'
                : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <span className="text-xs font-bold uppercase text-center">Upload Image</span>
          </button>

          {/* No Power */}
          <button
            onClick={handleRemovePrescription}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2
                    ${!selectedCart?.prescription_mode
                ? 'border-[#232320] bg-[#F3F0E7] text-[#232320]'
                : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
            </svg>
            <span className="text-xs font-bold uppercase text-center">No Power</span>
          </button>
        </div>

        {/* Prescription Table */}
        {selectedCart?.prescription_mode === 'manual' && selectedCart?.prescription && (
          <div className="mt-6 overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-xs text-center">
              <thead className="bg-[#232320] text-white font-bold uppercase">
                <tr>
                  <th className="p-2"></th>
                  <th className="p-2">SPH</th>
                  <th className="p-2">CYL</th>
                  <th className="p-2">AXIS</th>
                  <th className="p-2">OD</th>
                  <th className="p-2">PD</th>
                </tr>
              </thead>
              <tbody className="font-medium text-[#1F1F1F] divide-y divide-gray-100">
                <tr>
                  <td className="p-2 font-bold bg-gray-50 text-left">Right (OD)</td>
                  <td className="p-2">{selectedCart?.prescription?.right_sphere}</td>
                  <td className="p-2">{selectedCart?.prescription?.right_cylinder}</td>
                  <td className="p-2">{selectedCart?.prescription?.right_axis}</td>
                  <td className="p-2 text-[#4596F3]">{selectedCart?.prescription?.right_od}</td>
                  <td className="p-2">{selectedCart?.prescription?.right_pd}</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold bg-gray-50 text-left">Left (OS)</td>
                  <td className="p-2">{selectedCart?.prescription?.left_sphere}</td>
                  <td className="p-2">{selectedCart?.prescription?.left_cylinder}</td>
                  <td className="p-2">{selectedCart?.prescription?.left_axis}</td>
                  <td className="p-2 text-[#4596F3]">{selectedCart?.prescription?.left_od}</td>
                  <td className="p-2">{selectedCart?.prescription?.left_pd}</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold bg-gray-50 text-left">Add</td>
                  <td colSpan={5} className="p-2 text-left text-gray-500 italic">{selectedCart?.prescription?.remarks}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

      </div>

      <EpmPrescriptionsPopup
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        selectedCart={selectedCart}
        refetch={refetch}
      />

      <PowerTypeDialog
        refetch={refetch}
        selectedProduct={selectedProduct}
        selectedCart={selectedCart}
        open={openLensDialog}
        lenses={product?.lenses}
        onClose={handleSelectLens}
      />

      <UploadPrescriptionspopup
        refetch={refetch}
        open={openUploadDialog}
        onClose={() => setUploadOpenDialog(false)}
        selectedCart={selectedCart}
      />

      <SignUpModal
        open={openSignUpModal}
        setOpen={() => setOpenSignUpModal(true)}
        handleUpload={handleUpload}
        onHide={() => setOpenSignUpModal(false)}
        order={false}
        perscription={true}
        mode={mode}
      />
    </div>
  );
}

export default React.memo(ProductDetails);
