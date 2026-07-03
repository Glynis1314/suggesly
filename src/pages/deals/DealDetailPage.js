import { Link, useParams } from 'react-router-dom';
import { useDeals } from '../../context/DealsContext';

export default function DealDetailPage() {
  const { dealId } = useParams();
  const { deals } = useDeals();
  const deal = deals.find((item) => item.id === dealId);

  if (!deal) {
    return (
      <section className="p-4 md:p-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-2xl font-semibold text-slate-900">Deal not found</p>
          <p className="mt-3 text-slate-500">The deal you are looking for does not exist.</p>
          <Link to="/deals" className="mt-6 inline-flex rounded-xl bg-emerald-700 px-6 py-3 text-xl font-semibold text-white">
            Back to deals
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-slate-500">Deals &gt; Deal Details</p>
          <h1 className="mt-2 text-5xl font-semibold">{deal.dealName}</h1>
          <p className="mt-3 text-xl text-slate-500">{deal.associatedCompany}</p>
        </div>
        <Link to="/deals" className="rounded-xl bg-slate-100 px-5 py-3 text-xl font-semibold text-slate-700">
          Back to deals
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {[
              ['Deal Size', new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(deal.dealSize)],
              ['Deal Stage', deal.dealStage],
              ['Created', new Date(deal.dealCreatedDate).toLocaleDateString()],
              ['Last Activity', new Date(deal.lastActivityDate).toLocaleDateString()],
              ['Primary Contact', deal.primaryContact],
              ['Next Action', deal.nextAction],
              ['Probability', `${deal.dealProbability}%`],
              ['Source', deal.source],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{value || '-'}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-3xl bg-slate-50 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Deal Source Owner</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{deal.dealSourceOwner}</p>
            <p className="mt-1 text-sm text-slate-500">Source owner display value</p>
          </div>

          <div className="mt-6 rounded-3xl bg-slate-50 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Source Owner Name</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{deal.dealSourceOwnerName}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Associated Company</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{deal.associatedCompany}</p>
            <p className="mt-6 text-sm uppercase tracking-[0.2em] text-slate-500">Country / City</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{deal.country} / {deal.city}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Expected Close Date</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{new Date(deal.expectedCloseDate).toLocaleDateString()}</p>
            <p className="mt-6 text-sm uppercase tracking-[0.2em] text-slate-500">Remarks</p>
            <p className="mt-2 text-xl text-slate-700">{deal.remarks}</p>
            {deal.dealStage === 'Closed Lost' && (
              <>
                <p className="mt-6 text-sm uppercase tracking-[0.2em] text-slate-500">Lost Reason</p>
                <p className="mt-2 text-xl text-rose-700">{deal.lostReason}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
