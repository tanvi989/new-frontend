import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import DeleteDialog from "./DeleteDialog";
import Offers from "./Offers";
import { deleteProductFromCart, getMyPrescriptions } from "../api/retailerApis";
import { CartItem } from "../types";
import {
  calculateItemTotal,
  calculateCartSubtotal,
  getLensCoating,
  getTintInfo,
  getLensTypeDisplay,
  getLensIndex,
  formatFrameSize,
} from "../utils/priceUtils";

interface CustomerCartViewProps {
  open: boolean;
  close: () => void;
  carts: CartItem[];
  refetch: () => void;
  onCheckout?: () => void;
  buttonText?: string;
  shippingCost?: number;
  discountAmount?: number;
}

// Helper: Get PD from prescription from all possible paths
function getPdFromPrescription(prescription: any): { pdSingle?: string; pdRight?: string; pdLeft?: string; isDual?: boolean } {
  if (!prescription) return {};
  const d = prescription.prescriptionDetails || prescription.data || prescription;
  const root = prescription as any;
  const pdSingle = root.pdSingle ?? root.single ?? d.pdSingle ?? d.single ?? d.totalPD ?? (d.pdOD && d.pdOS ? `${d.pdOD}/${d.pdOS}` : undefined);
  const pdRight = root.pdRight ?? root.right ?? d.pdRight ?? d.right ?? d.pdOD;
  const pdLeft = root.pdLeft ?? root.left ?? d.pdLeft ?? d.left ?? d.pdOS;
  const isDual = root.pdType === "Dual" || root.pdType === "dual" || !!(pdRight && pdLeft);
  return { pdSingle, pdRight, pdLeft, isDual };
}

const CustomerCartView: React.FC<CustomerCartViewProps> = ({
  open,
  close,
  carts,
  refetch,
  onCheckout,
  buttonText,
  shippingCost = 0,
  discountAmount,
}) => {
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedCart, setSelectedCart] = useState<CartItem | null>(null);
  const [viewingPrescription, setViewingPrescription] = useState<{
    name: string;
    pres: any;
  } | null>(null);
  const navigate = useNavigate();

  // Fetch User Prescriptions for detailed view
  const { data: prescriptionsResponse } = useQuery({
    queryKey: ["prescriptions"],
    queryFn: () => getMyPrescriptions(),
    enabled: !!localStorage.getItem("token") || !!localStorage.getItem("guest_id"),
    staleTime: 5 * 60 * 1000,
  });

  const userPrescriptions = prescriptionsResponse?.data?.data || [];

  const { mutate: handleDeleteItem } = useMutation({
    mutationFn: (cartId: number) =>
      deleteProductFromCart(cartId, undefined, undefined),
    onSuccess: () => {
      setDeleteDialog(false);
      setSelectedCart(null);
      refetch();
    },
    onError: (error) => {
      console.error("Delete failed", error);
      setDeleteDialog(false);
      refetch();
    },
  });

  const handleDelete = () => {
    if (selectedCart) handleDeleteItem(selectedCart.cart_id);
  };

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
      return;
    }
    close();
    if (localStorage.getItem("token")) {
      navigate("/payment");
    } else {
      navigate("/login", { state: { returnTo: "/payment" } });
    }
  };

  if (!carts) return "No Cart";

  const subtotal = Array.isArray(carts) ? calculateCartSubtotal(carts) : 0;
  const appliedOffer = Array.isArray(carts)
    ? carts.find((c) => c.offer)?.offer || null
    : null;
  const offerAmount = Array.isArray(carts)
    ? carts.reduce((sum, item) => sum + (item.offer_applied_discount || 0), 0)
    : 0;

  // ── Robust prescription lookup ──
  const getPrescription = (cart: CartItem): any | null => {
    try {
      const cartId = cart.cart_id;
      const productSku = (cart as any).product?.products?.skuid || cart.product_id;
      const activeCartIds = new Set(carts.map((c) => String(c.cart_id)));

      // 1. Backend prescription
      if (
        (cart as any).prescription &&
        typeof (cart as any).prescription === "object" &&
        Object.keys((cart as any).prescription).length > 0
      ) {
        const pres = (cart as any).prescription;
        const presCartId =
          pres?.associatedProduct?.cartId ??
          pres?.data?.associatedProduct?.cartId ??
          pres?.cartId ??
          pres?.data?.cartId;
        if (!presCartId || (String(presCartId) === String(cartId) && activeCartIds.has(String(cartId)))) {
          return cart.prescription;
        }
      }

      // 2. Local Storage
      const local = JSON.parse(localStorage.getItem("prescriptions") || "[]");
      const localMatch = local.find((p: any) => {
        const pCartId = p?.associatedProduct?.cartId ?? p?.data?.associatedProduct?.cartId;
        return pCartId && String(pCartId) === String(cartId) && activeCartIds.has(String(pCartId));
      });
      if (localMatch) return localMatch.prescriptionDetails || localMatch.data || localMatch;

      // 3. Session Storage
      if (productSku) {
        const session = JSON.parse(sessionStorage.getItem("productPrescriptions") || "{}");
        if (session[productSku]) {
          const pCartId = session[productSku]?.associatedProduct?.cartId ?? session[productSku]?.data?.associatedProduct?.cartId;
          if (pCartId == null || (String(pCartId) === String(cartId) && activeCartIds.has(String(pCartId)))) {
            return session[productSku].prescriptionDetails || session[productSku].data || session[productSku];
          }
        }
      }

      // 4. User Prescriptions from Database
      if (userPrescriptions && userPrescriptions.length > 0) {
        const getPrescriptionDate = (p: any) => {
          const raw = p?.created_at ?? p?.data?.created_at ?? p?.createdAt ?? 0;
          if (typeof raw === "number") return raw;
          if (typeof raw === "string") return new Date(raw).getTime() || 0;
          return 0;
        };

        let matches = userPrescriptions.filter((p: any) => {
          if (!p) return false;
          const dataCartId = p?.data?.associatedProduct?.cartId;
          const rootCartId = p?.associatedProduct?.cartId;
          const directCartId = p?.data?.cartId || p?.cartId;
          const matchesCartId =
            (dataCartId && String(dataCartId) === String(cartId)) ||
            (rootCartId && String(rootCartId) === String(cartId)) ||
            (directCartId && String(directCartId) === String(cartId));
          if (!matchesCartId) return false;
          const prescriptionCartId = rootCartId || dataCartId || directCartId;
          return prescriptionCartId && activeCartIds.has(String(prescriptionCartId));
        });

        if (matches.length > 0) {
          const photoMatches = matches.filter((p: any) => p && p.type === "photo");
          const pool = photoMatches.length > 0 ? photoMatches : matches;
          return pool.sort((a: any, b: any) => getPrescriptionDate(b) - getPrescriptionDate(a))[0];
        }
      }

      return null;
    } catch {
      return null;
    }
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[199] transition-opacity duration-300"
          onClick={close}
        />
      )}

      {/* Sidebar Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[475px] bg-white shadow-2xl z-[200] transform transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h2 className="text-xl font-bold text-[#1F1F1F] font-sans">
              Cart View
            </h2>
            <button
              onClick={close}
              className="p-2 text-gray-400 hover:text-[#E94D37] transition-colors rounded-full hover:bg-gray-50"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {carts && carts.length > 0 ? (
              <ul className="space-y-5">
                {carts.map((cart) => {
                  const framePrice = Number(
                    (cart as any).product?.products?.list_price || 0
                  );
                  const lensIndexInfo = getLensIndex(cart);
                  const coating = getLensCoating(cart);
                  const tintInfo = getTintInfo(cart);
                  const prescription = getPrescription(cart);
                  const productName =
                    (cart as any).product?.products?.naming_system ||
                    (cart as any).product?.products?.brand ||
                    "Item";

                  return (
                    <li
                      key={cart.cart_id}
                      className="p-3 rounded-xl border border-gray-200 bg-white shadow-sm"
                    >
                      {/* ... Item Card Content (Image, Details, Table) ... */}
                      <div className="flex gap-3">
                        <div className="w-[90px] h-[90px] shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={
                              (cart as any).product?.products?.image ||
                              "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=300"
                            }
                            alt="Product"
                            className="w-full h-full object-cover mix-blend-multiply"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h4 className="text-sm font-bold text-[#1F1F1F]">
                                {productName}
                              </h4>
                              <p className="text-xs text-[#525252] mt-0.5">
                                {(cart as any).product?.products?.framecolor}{" "}
                                {(cart as any).product?.products?.style} For{" "}
                                {(cart as any).product?.products?.gender}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedCart(cart);
                                setDeleteDialog(true);
                              }}
                              className="shrink-0 p-1 text-gray-400 hover:text-[#E94D37] transition-colors"
                              aria-label="Remove"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Price breakdown table */}
                      <div className="mt-3 border border-gray-200 rounded text-xs">
                        <div className="flex border-b border-gray-200">
                          <div className="w-1/2 py-2 px-2 font-semibold text-[#1F1F1F] border-r border-gray-200">
                            Frame Price:
                          </div>
                          <div className="w-1/2 py-2 px-2 text-right font-semibold text-[#1F1F1F]">
                            £{framePrice.toFixed(2)}
                          </div>
                        </div>
                        <div className="flex border-b border-gray-200">
                          <div className="w-1/2 py-2 px-2 font-semibold text-[#1F1F1F] border-r border-gray-200">
                            Frame Size:
                          </div>
                          <div className="w-1/2 py-2 px-2 text-[#525252]">
                            {formatFrameSize(
                              (cart as any).product?.products?.size
                            )}
                          </div>
                        </div>
                        <div className="flex border-b border-gray-200">
                          <div className="w-1/2 py-2 px-2 font-semibold text-[#1F1F1F] border-r border-gray-200">
                            Lens Type:
                          </div>
                          <div className="w-1/2 py-2 px-2 text-[#525252]">
                            {getLensTypeDisplay(cart)}
                          </div>
                        </div>
                        <div className="flex border-b border-gray-200">
                          <div className="w-1/2 py-2 px-2 font-semibold text-[#1F1F1F] border-r border-gray-200">
                            Lens Index:
                          </div>
                          <div className="w-1/2 py-2 px-2 flex justify-between items-center">
                            <span className="text-[#525252] truncate pr-1">
                              {lensIndexInfo.index}
                            </span>
                            <span className="font-semibold text-[#1F1F1F] shrink-0">
                              £{lensIndexInfo.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        {tintInfo ? (
                          <div className="flex">
                            <div className="w-1/2 py-2 px-2 font-semibold text-[#1F1F1F] border-r border-gray-200">
                              Lens Tint:
                            </div>
                            <div className="w-1/2 py-2 px-2 flex justify-between items-center">
                              <span className="text-[#525252]">
                                {tintInfo.type}
                                {tintInfo.color ? `-${tintInfo.color}` : ""}
                              </span>
                              <span className="font-semibold text-[#1F1F1F]">
                                £{Number(tintInfo.price).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex">
                            <div className="w-1/2 py-2 px-2 font-semibold text-[#1F1F1F] border-r border-gray-200">
                              Lens Coating:
                            </div>
                            <div className="w-1/2 py-2 px-2 flex justify-between items-center">
                              <span className="text-[#525252]">{coating.name}</span>
                              <span className="font-semibold text-[#1F1F1F]">
                                £{Number(coating.price || 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Prescription button */}
                      <div className="mt-3">
                        {prescription ? (
                          <button
                            onClick={() =>
                              setViewingPrescription({
                                name: productName,
                                pres: prescription,
                              })
                            }
                            className="text-xs font-bold text-white bg-[#E94D37] hover:bg-[#bf3e2b] px-3 py-1.5 rounded-md transition-colors"
                          >
                            View Prescription
                          </button>
                        ) : (
                          <p className="text-xs text-red-400 font-semibold">
                            ⚠ No prescription added
                          </p>
                        )}
                      </div>

                      {/* Line total */}
                      <div className="mt-3 flex justify-end items-center gap-2">
                        <span className="text-xs font-bold text-[#1F1F1F]">
                          Total
                        </span>
                        <span className="text-sm font-bold text-[#4596F3]">
                          £{calculateItemTotal(cart).toFixed(2)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="mb-4 opacity-50"
                >
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <p className="font-medium">Your cart is empty</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {carts && carts.length > 0 && (
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <Offers
                refetch={refetch}
                listPrice={subtotal}
                offer={appliedOffer}
                offerAmount={offerAmount}
              />
              <div className="space-y-2 mb-4 pt-2">
                <div className="flex justify-between text-sm font-medium text-[#1F1F1F]">
                  <span>Subtotal</span>
                  <span>£{subtotal.toFixed(2)}</span>
                </div>
                {discountAmount != null && discountAmount > 0 && (
                  <div className="flex justify-between text-sm font-medium text-[#00C853]">
                    <span>Discount</span>
                    <span>- £{Number(discountAmount).toFixed(2)}</span>
                  </div>
                )}
                {shippingCost != null && shippingCost > 0 && (
                  <div className="flex justify-between text-sm font-medium text-[#1F1F1F]">
                    <span>Shipping</span>
                    <span>£{Number(shippingCost).toFixed(2)}</span>
                  </div>
                )}
                {((shippingCost ?? 0) > 0 || (discountAmount ?? 0) > 0) && (
                  <div className="flex justify-between text-base font-bold text-[#1F1F1F] pt-2 border-t border-gray-200">
                    <span>Total Payable</span>
                    <span>
                      £
                      {(
                        subtotal -
                        (discountAmount ?? 0) +
                        (shippingCost ?? 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={handleCheckout}
                className={`w-full py-3 font-bold rounded-full transition-colors shadow-lg uppercase tracking-wider text-sm ${
                  onCheckout
                    ? "bg-[#E94D37] hover:bg-red-600 text-white"
                    : "bg-[#232320] hover:bg-black text-white"
                }`}
              >
                {onCheckout ? buttonText || "Checkout" : "Checkout"}
              </button>
            </div>
          )}
        </div>
      </div>

      <DeleteDialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        itemType="product"
        onConfirm={handleDelete}
      />

      {/* ══════════════════════════════════════════════
          PRESCRIPTION MODAL — Manual Style Format
          ══════════════════════════════════════════════ */}
      {viewingPrescription &&
        (() => {
          const rawPres = viewingPrescription.pres;

          // Merge top-level and nested data
          const details = {
            ...rawPres,
            ...(rawPres.prescriptionDetails || rawPres.data || {})
          };

          const currentPd = getPdFromPrescription(rawPres);
          const isPdf = details.image_url?.toLowerCase().endsWith('.pdf') || details.fileType === 'application/pdf';
          const isUpload = details.type === "upload" || details.type === "photo" || !!details.image_url;

          // Extract fields for manual view (support both nested od/os and flat rightSph/leftSph formats)
          const od = details.od || {};
          const os = details.os || {};

          const rightSph = od.sph || details.rightSph || details.right_sph || "";
          const rightCyl = od.cyl || details.rightCyl || details.right_cyl || "";
          const rightAxis = od.axis || details.rightAxis || details.right_axis || "";
          const leftSph = os.sph || details.leftSph || details.left_sph || "";
          const leftCyl = os.cyl || details.leftCyl || details.left_cyl || "";
          const leftAxis = os.axis || details.leftAxis || details.left_axis || "";

          // Prism
          const odPrism = od.prism || {};
          const osPrism = os.prism || {};

          // Reading/Add Power
          const hasReadingPower = details.readingPowerRight || details.readingPowerLeft || details.addPower;

          return (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60">
              <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col">

                {/* ── Modal Header ── */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0 z-10">
                  <h2 className="text-xl font-bold text-[#1F1F1F]">
                    Prescription Details
                  </h2>
                  <button
                    onClick={() => setViewingPrescription(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Close"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* ── Modal Body ── */}
                <div className="p-6 space-y-6 flex-1 overflow-y-auto">

                  {/* ════════════════════════════════
                      SECTION A: Upload Layout
                      ════════════════════════════════ */}
                  {isUpload ? (
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">
                          Uploaded Prescription
                        </h3>
                        {details.image_url && (
                          <div className="mb-4">
                            {isPdf ? (
                              <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-lg">
                                <svg className="w-12 h-12 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <p className="text-sm font-medium text-gray-900 mb-2">{details.fileName || "Prescription.pdf"}</p>
                              </div>
                            ) : (
                              <img
                                src={details.image_url}
                                alt="Prescription"
                                className="max-w-full max-h-48 object-contain rounded-lg border border-gray-200 mx-auto"
                              />
                            )}

                            <a
                              href={details.image_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#025048] underline text-sm mt-2 inline-block font-medium text-center w-full"
                            >
                              {isPdf ? "View Full PDF" : "View Full Size Image"}
                            </a>
                          </div>
                        )}
                        {details.fileName && !isPdf && (
                          <p className="text-sm text-gray-600 mb-2">
                            File: {details.fileName}
                          </p>
                        )}
                      </div>

                      {/* PD Display for Upload */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                          Pupillary Distance (PD)
                        </p>
                        {currentPd.isDual && (currentPd.pdRight || currentPd.pdLeft) ? (
                          <p className="text-base font-medium text-[#1F1F1F]">
                            R: {currentPd.pdRight} / L: {currentPd.pdLeft}
                          </p>
                        ) : currentPd.pdSingle ? (
                          <p className="text-base font-medium text-[#1F1F1F]">
                            {currentPd.pdSingle}
                          </p>
                        ) : (
                          <p className="text-base font-medium text-gray-400 italic">
                            Not provided
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* ════════════════════════════════
                       SECTION B: Manual Prescription Layout
                       ════════════════════════════════ */
                    <>
                      {/* Prescription For */}
                      {details.prescriptionFor && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">
                            Prescription For
                          </h3>
                          <p className="text-base font-medium text-[#1F1F1F]">
                            {details.prescriptionFor === "self" ? "Self" : details.patientName || "Other"}
                          </p>
                        </div>
                      )}

                      {/* Right Eye (OD) */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="text-base font-bold text-[#1F1F1F] mb-4">
                          Right Eye (OD)
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">SPH</p>
                            <p className="text-base font-medium text-[#1F1F1F]">{rightSph || "0.00"}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">CYL</p>
                            <p className="text-base font-medium text-[#1F1F1F]">{rightCyl || "0.00"}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Axis</p>
                            <p className="text-base font-medium text-[#1F1F1F]">{rightAxis || "-"}</p>
                          </div>
                        </div>

                        {/* Prism for OD */}
                        {odPrism && (odPrism.horizontal || odPrism.vertical) && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-3">Prism</p>
                            <div className="grid grid-cols-2 gap-4">
                              {odPrism.horizontal && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Horizontal</p>
                                  <p className="text-sm font-medium text-[#1F1F1F]">
                                    {odPrism.horizontal} {odPrism.baseHorizontal}
                                  </p>
                                </div>
                              )}
                              {odPrism.vertical && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Vertical</p>
                                  <p className="text-sm font-medium text-[#1F1F1F]">
                                    {odPrism.vertical} {odPrism.baseVertical}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Left Eye (OS) */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="text-base font-bold text-[#1F1F1F] mb-4">
                          Left Eye (OS)
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">SPH</p>
                            <p className="text-base font-medium text-[#1F1F1F]">{leftSph || "0.00"}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">CYL</p>
                            <p className="text-base font-medium text-[#1F1F1F]">{leftCyl || "0.00"}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Axis</p>
                            <p className="text-base font-medium text-[#1F1F1F]">{leftAxis || "-"}</p>
                          </div>
                        </div>

                        {/* Prism for OS */}
                        {osPrism && (osPrism.horizontal || osPrism.vertical) && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-3">Prism</p>
                            <div className="grid grid-cols-2 gap-4">
                              {osPrism.horizontal && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Horizontal</p>
                                  <p className="text-sm font-medium text-[#1F1F1F]">
                                    {osPrism.horizontal} {osPrism.baseHorizontal}
                                  </p>
                                </div>
                              )}
                              {osPrism.vertical && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Vertical</p>
                                  <p className="text-sm font-medium text-[#1F1F1F]">
                                    {osPrism.vertical} {osPrism.baseVertical}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ADD Power, PD, Birth Year Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {hasReadingPower && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                              Reading / Add Power
                            </p>
                            <div className="text-base font-medium text-[#1F1F1F]">
                              {(details.readingPowerRight || details.readingPowerLeft) ? (
                                <div className="flex gap-4">
                                  {details.readingPowerRight && <span>R: {details.readingPowerRight}</span>}
                                  {details.readingPowerLeft && <span>L: {details.readingPowerLeft}</span>}
                                </div>
                              ) : (
                                <span>{details.addPower}</span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                            Pupillary Distance
                          </p>
                          {currentPd.isDual && (currentPd.pdRight || currentPd.pdLeft) ? (
                            <p className="text-base font-medium text-[#1F1F1F]">
                              R: {currentPd.pdRight} / L: {currentPd.pdLeft}
                            </p>
                          ) : currentPd.pdSingle ? (
                            <p className="text-base font-medium text-[#1F1F1F]">
                              {currentPd.pdSingle}
                            </p>
                          ) : (
                            <p className="text-base font-medium text-gray-400 italic">Not provided</p>
                          )}
                        </div>

                        {details.birthYear && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                              Birth Year
                            </p>
                            <p className="text-base font-medium text-[#1F1F1F]">
                              {details.birthYear}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Additional Info */}
                      {rawPres.additionalInfo && (
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">
                            Additional Information
                          </h3>
                          <p className="text-base text-[#1F1F1F]">
                            {rawPres.additionalInfo}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* ── Modal Footer ── */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 shrink-0">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setViewingPrescription(null)}
                      className="px-6 py-2 bg-[#025048] text-white rounded-lg font-bold hover:bg-[#013b35] transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </>
  );
};

export default React.memo(CustomerCartView);