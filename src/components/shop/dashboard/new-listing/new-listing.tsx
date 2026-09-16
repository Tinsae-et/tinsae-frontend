import { BeforePublication, DailyStockCheckIn } from "./buyer-preview"
import { ProductPreview } from "./buyer-preview"
import { Form } from "./product-forms"

export default function NewProductForm({access, shopSlug}:{access: string, shopSlug: string}) {
    
    return (
        <div className="grid md:grid-cols-3 p-0 bg-gray-50">
            <div className="flex flex-col gap-4 col-span-2">
                <Form access={access} shopSlug={shopSlug}/>
            </div>
            <div className="p-5 flex flex-col gap-4">
                <ProductPreview />
                <DailyStockCheckIn />
                <BeforePublication />
            </div>
        </div>
    )
}
