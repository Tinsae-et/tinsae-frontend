import { BeforePublication, DailyStockCheckIn } from "./buyer-preview"
import { ProductPreview } from "./buyer-preview"
import { PriceAndStockForm, ProductForm, ProductImageForm, ProductSpecificationForm } from "./product-forms"

export default function NewProductForm() {
    return (
        <div className="grid md:grid-cols-3 p-5 bg-gray-200">
            <div className="flex flex-col gap-4 col-span-2">
                <ProductForm />
                <ProductImageForm />
                <ProductSpecificationForm />
                <PriceAndStockForm />
            </div>
            <div className="p-5 flex flex-col gap-4">
                <ProductPreview />
                <DailyStockCheckIn />
                <BeforePublication />
            </div>
        </div>
    )
}
