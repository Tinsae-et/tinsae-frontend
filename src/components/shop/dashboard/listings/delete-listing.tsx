import { Pill } from "@/components/tinsae/pill"
import { deleteProduct } from "@/lib/api";
import { ShopProduct } from "@/lib/types";
import { redirect } from "next/navigation";
import React from "react"

type Props = {
    setDeleteItem: (b: boolean)=>void;
    access: string;
    product: ShopProduct;
}
function DeleteListing({setDeleteItem, access, product}: Props) {
    const deleteItem = async () => {
        await deleteProduct(product.shop_slug, product.slug, access);
        redirect("/shop/dashboard/overview");
    }
  return (
    <div
      onClick={() => setDeleteItem(false)}
      className="fixed inset-0 flex items-center justify-center backdrop-blur-[14px] bg-black/50 p-2"
    >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white absolute border-gray-600 shadow-2xl rounded-2xl py-5 px-10 flex flex-col gap-4"
        >
            <p className="max-w-[300px] text-center">Are you sure you want to delete <span className="font-bold">{product.name}</span>?</p>
            <div className="flex items-center justify-between">
                <Pill className="bg-white text-black hover:bg-gray-200 border-gray-600" onClick={()=>setDeleteItem(false)}>
                    Cancel
                </Pill>

                <Pill onClick={()=>deleteItem()}>
                    Delete
                </Pill>
            </div>
        </div>
    </div>
  )
}

export default DeleteListing;