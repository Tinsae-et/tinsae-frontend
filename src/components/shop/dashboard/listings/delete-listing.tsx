import { Pill } from "@/components/tinsae/pill"
import { deleteProduct } from "@/lib/api";
import { ShopProduct } from "@/lib/types";
import { AlertTriangle, X } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react"

type Props = {
    setDeleteItem: (b: boolean) => void;
    access: string;
    product: ShopProduct;
}
function DeleteListing({ setDeleteItem, access, product }: Props) {
    const deleteItem = async () => {
        await deleteProduct(product.shop_slug, product.slug, access);
        redirect("/shop/dashboard/overview");
    }
    return (
        <div
            onClick={() => setDeleteItem(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-150"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-sm rounded-3xl border border-neutral-100 bg-white p-6 shadow-xl shadow-black/10 animate-in zoom-in-95 slide-in-from-bottom-2 duration-200"
            >
                <button
                    onClick={() => setDeleteItem(false)}
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="flex h-12 w-12 items-center justify-center mx-auto rounded-full bg-red-50">
                    <AlertTriangle className="h-6 w-6 text-red-500" strokeWidth={2} />
                </div>
                <h3 className="mt-4 text-lg text-center font-semibold text-neutral-900">
                    Delete this listing?
                </h3>
                <p className="mt-1.5 text-sm text-center leading-relaxed text-neutral-500">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-neutral-800">{product.name}</span>?
                    This action can&apos;t be undone.
                </p>

                <div className="mt-6 flex items-center gap-3">
                    <button
                        onClick={() => setDeleteItem(false)}
                        className="flex-1 rounded-full border border-neutral-200 bg-white py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => deleteItem()}
                        className="flex-1 rounded-full bg-red-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-red-600/20 transition-colors hover:bg-red-700"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DeleteListing;