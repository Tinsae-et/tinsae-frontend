
import HowBuyersSee from "./how-buyers-see";
import WhyVerification from "./why-verification";
import Banner from "./banner";
import Steps from "./steps";


export default function VerificationPage() {
  const completed = 1;

  return (
    <div className="min-h-screen bg-tn-paper p-6">
      <div className="mx-auto max-w-6xl">
        {/* Hero banner */}
        <Banner completed={completed} />

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Steps */}
          <div className="space-y-3 md:col-span-2">
            <Steps/>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* How buyers will see you */}
            <HowBuyersSee />

            {/* What verification unlocks */}
            <WhyVerification />
          </div>
        </div>
      </div>
    </div>
  );
}
