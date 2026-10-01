import React from 'react';
import { Thermometer, CheckCircle2 } from 'lucide-react';
export const DistributionNetwork = () => {
    const routes = [
        {
            routeId: 'ROUTE-01',
            name: 'Janakpurdham Metropolitan Core',
            areas: 'Ramanand Chowk, Hospital Road, Bhanu Chowk, Pidari Chowk, Station Road',
            frequency: 'Twice Daily (Morning 8:30 AM & Afternoon 2:30 PM)',
            vehicle: 'Dedicated Refrigerated Van #1',
            transitTime: 'Same-Day (Under 2 Hours)',
        },
        {
            routeId: 'ROUTE-02',
            name: 'Dhanusha Highway & Rural Centers',
            areas: 'Sakhuwa Mahendranagar, Dhanushadham, Dhalkebar, Sabaila, Ganeshman Charnath',
            frequency: 'Daily Scheduled Morning Route (Depart 9:00 AM)',
            vehicle: 'Insulated Delivery Van #2',
            transitTime: 'Same-Day (3-5 Hours)',
        },
        {
            routeId: 'ROUTE-03',
            name: 'Mahottari & Jaleshwar Link',
            areas: 'Jaleshwar Municipality, Bardibas, Gaushala, Pipara',
            frequency: 'Daily Scheduled Morning Route',
            vehicle: 'Insulated Delivery Van #3',
            transitTime: 'Same-Day',
        },
        {
            routeId: 'ROUTE-04',
            name: 'Siraha & Lahan Eastern Corridor',
            areas: 'Lahan Hospital Chowk, Mirchaiya, Golbazar, Siraha Bazaar',
            frequency: 'Daily Route & Overnight Staging',
            vehicle: 'Distribution Van #4',
            transitTime: 'Next-Day / Scheduled 12 Hours',
        },
    ];
    return (<div className="py-16 bg-slate-50 border-y border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-cyan-700 mb-1">
            Madhesh Logistics Infrastructure
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Cold-Chain & Daily Van Delivery Coverage
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Operating from our central warehouse on Station Road, Janakpurdham with calibrated temperature data loggers and scheduled dispatch routes.
          </p>
        </div>

        {/* Routes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {routes.map(r => (<div key={r.routeId} className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs hover:shadow-sm transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded">
                    {r.routeId}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5"/>
                    <span>Daily Service</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">{r.name}</h3>
                <p className="text-xs text-slate-600 mb-3">{r.areas}</p>

                <div className="space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
                  <div className="flex justify-between">
                    <span>Dispatch Cadence:</span>
                    <strong className="text-slate-800">{r.frequency}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Vehicle Specification:</span>
                    <span className="text-slate-700">{r.vehicle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Delivery Time:</span>
                    <strong className="text-cyan-800 font-mono">{r.transitTime}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Thermometer className="h-3.5 w-3.5 text-blue-600"/>
                  <span>2°C - 8°C Cold Box Compatible</span>
                </span>
                <span className="font-medium text-slate-700">Tamper-Evident Seals</span>
              </div>
            </div>))}
        </div>

      </div>
    </div>);
};
