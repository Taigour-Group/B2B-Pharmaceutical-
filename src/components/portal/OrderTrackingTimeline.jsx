import React from 'react';
import { formatDateTime } from '../../utils/formatters';
import { CheckCircle2, Clock, Package, Truck, MapPin, Thermometer, FileText, RotateCcw, Sparkles } from 'lucide-react';
export const OrderTrackingTimeline = ({ order, onViewInvoice, onReorder, onSimulateAdvance, }) => {
    const steps = [
        {
            key: 'PLACED',
            label: 'Order Placed',
            sublabel: 'Verified & Logged',
            icon: Clock,
        },
        {
            key: 'PROCESSING',
            label: 'Warehouse Processing',
            sublabel: 'FEFO Picked & Sealed',
            icon: Package,
        },
        {
            key: 'IN_TRANSIT',
            label: 'In Transit',
            sublabel: 'Van En Route',
            icon: Truck,
        },
        {
            key: 'DELIVERED',
            label: 'Delivered',
            sublabel: 'Pharmacist Received',
            icon: CheckCircle2,
        },
    ];
    // Map order status to stage index (0 to 3)
    const getStageIndex = (status) => {
        switch (status) {
            case 'PLACED':
            case 'UNDER_REVIEW':
                return 0;
            case 'CONFIRMED':
            case 'PROCESSING':
            case 'PACKED':
                return 1;
            case 'DISPATCHED':
                return 2;
            case 'DELIVERED':
                return 3;
            default:
                return 0;
        }
    };
    const currentStageIndex = getStageIndex(order.status);
    const progressPercent = Math.min(100, Math.round(((currentStageIndex) / (steps.length - 1)) * 100));
    // Determine van and route information
    const vanInfo = {
        vanNumber: 'Refrigerated Route Van #3',
        driverName: 'Shyam Thakur',
        driverPhone: '+977 9801239811',
        currentLocation: order.status === 'DELIVERED'
            ? 'Delivered at Pharmacy'
            : order.status === 'DISPATCHED'
                ? 'Approaching Ramanand Chowk (approx. 15 mins)'
                : 'Janakpur Central Depot Staging Bay',
        temperatureLog: '4.2°C (Cold-Chain Verified)',
        estimatedArrival: order.status === 'DELIVERED'
            ? 'Completed Today'
            : 'Today by 2:30 PM (Morning Route Van)',
    };
    // Find step timestamp if available in order history
    const getStepTimestamp = (key) => {
        if (key === 'PLACED') {
            const match = order.statusHistory.find(h => h.status === 'PLACED');
            return match ? formatDateTime(match.timestamp) : formatDateTime(order.placedAt);
        }
        if (key === 'PROCESSING') {
            const match = order.statusHistory.find(h => h.status === 'PACKED' || h.status === 'CONFIRMED');
            return match ? formatDateTime(match.timestamp) : null;
        }
        if (key === 'IN_TRANSIT') {
            const match = order.statusHistory.find(h => h.status === 'DISPATCHED');
            return match ? formatDateTime(match.timestamp) : null;
        }
        if (key === 'DELIVERED') {
            const match = order.statusHistory.find(h => h.status === 'DELIVERED');
            return match ? formatDateTime(match.timestamp) : null;
        }
        return null;
    };
    const getNextStatus = (current) => {
        if (current === 'PLACED')
            return 'PACKED';
        if (current === 'CONFIRMED' || current === 'PACKED')
            return 'DISPATCHED';
        if (current === 'DISPATCHED')
            return 'DELIVERED';
        return null;
    };
    const nextStatus = getNextStatus(order.status);
    return (<div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm space-y-6">
      
      {/* Top Meta Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-base font-bold text-slate-900">
              {order.orderNumber}
            </span>
            <span className={`rounded-full px-3 py-0.5 text-xs font-bold tracking-tight uppercase ${order.status === 'DELIVERED'
            ? 'bg-emerald-100 text-emerald-800'
            : order.status === 'DISPATCHED'
                ? 'bg-blue-100 text-blue-800 animate-pulse'
                : order.status === 'PACKED'
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-amber-100 text-amber-800'}`}>
              ● {order.status === 'DISPATCHED' ? 'In Transit' : order.status}
            </span>
          </div>

          <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
            <span>Destination: <strong className="text-slate-700">{order.deliveryAddress}</strong></span>
            <span>·</span>
            <span>Receiver: <strong className="text-slate-700">{order.customerName}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {order.invoiceId && onViewInvoice && (<button onClick={() => onViewInvoice(order.invoiceId)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs">
              <FileText className="h-3.5 w-3.5 text-cyan-600"/>
              <span>Tax Invoice</span>
            </button>)}

          {onReorder && (<button onClick={e => onReorder(order, e)} className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-2xs">
              <RotateCcw className="h-3.5 w-3.5 text-cyan-400"/>
              <span>Reorder</span>
            </button>)}
        </div>
      </div>

      {/* Visual Timeline Track */}
      <div className="py-2">
        <div className="relative">
          
          {/* Background Connecting Rail */}
          <div className="absolute top-5 left-6 right-6 h-1 bg-slate-100 -translate-y-1/2 z-0 hidden sm:block"/>
          
          {/* Active Fill Rail */}
          <div className="absolute top-5 left-6 h-1 bg-gradient-to-r from-cyan-500 to-emerald-500 -translate-y-1/2 z-0 transition-all duration-700 hidden sm:block" style={{ width: `calc(${progressPercent}% * 0.88)` }}/>

          {/* Stepper Nodes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 sm:gap-2 relative z-10">
            {steps.map((step, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const isPending = idx > currentStageIndex;
            const timestamp = getStepTimestamp(step.key);
            return (<div key={step.key} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                  
                  {/* Node Circle */}
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all ${isCompleted
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 ring-4 ring-emerald-50'
                    : isCurrent
                        ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30 ring-4 ring-cyan-100 scale-110'
                        : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
                    {isCompleted ? (<CheckCircle2 className="h-5 w-5"/>) : (<step.icon className={`h-5 w-5 ${isCurrent ? 'animate-pulse' : ''}`}/>)}
                  </div>

                  {/* Text Details */}
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-bold ${isCurrent ? 'text-cyan-900 font-extrabold' : isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                      {step.label}
                    </div>

                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {step.sublabel}
                    </div>

                    {timestamp ? (<div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {timestamp}
                      </div>) : isCurrent ? (<div className="text-[10px] text-cyan-600 font-semibold mt-0.5 flex items-center sm:justify-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-600 animate-ping"/>
                        <span>In Progress</span>
                      </div>) : (<div className="text-[10px] text-slate-300 mt-0.5 font-mono">
                        Upcoming
                      </div>)}
                  </div>

                </div>);
        })}
          </div>

        </div>
      </div>

      {/* Real-Time Dispatch & Logistics Status Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl bg-slate-50/80 border border-slate-200/80 p-4 text-xs">
        
        {/* Left: Driver and Route Van */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase text-[10px] tracking-wider">
            <Truck className="h-3.5 w-3.5 text-cyan-700"/>
            <span>Assigned Dispatch Vehicle</span>
          </div>
          <div className="font-semibold text-slate-800">{vanInfo.vanNumber}</div>
          <div className="text-slate-500 flex items-center gap-2">
            <span>Driver: <strong>{vanInfo.driverName}</strong></span>
            <span>·</span>
            <span className="font-mono text-cyan-700">{vanInfo.driverPhone}</span>
          </div>
        </div>

        {/* Middle: Location & ETA */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase text-[10px] tracking-wider">
            <MapPin className="h-3.5 w-3.5 text-cyan-700"/>
            <span>Live Route Position</span>
          </div>
          <div className="text-slate-800 font-medium">{vanInfo.currentLocation}</div>
          <div className="text-slate-500">
            Estimated Arrival: <strong className="text-slate-700">{vanInfo.estimatedArrival}</strong>
          </div>
        </div>

        {/* Right: Cold Chain & Quality Assurance */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase text-[10px] tracking-wider">
            <Thermometer className="h-3.5 w-3.5 text-blue-600"/>
            <span>Storage & Cold-Chain Telemetry</span>
          </div>
          <div className="text-slate-800 font-semibold flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500"/>
            <span>{vanInfo.temperatureLog}</span>
          </div>
          <div className="text-slate-500">
            Tamper-evident seals intact · FEFO verified
          </div>
        </div>

      </div>

      {/* Interactive Simulation Helper (Allows advancing order stage directly for demonstration) */}
      {onSimulateAdvance && nextStatus && (<div className="flex items-center justify-between rounded-lg bg-cyan-50/60 border border-cyan-100 px-4 py-2.5 text-xs text-cyan-950">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-600 shrink-0"/>
            <span>
              <strong>Dispatch Simulator:</strong> Next operational stage is <strong>{nextStatus}</strong>.
            </span>
          </div>
          <button onClick={() => onSimulateAdvance(order.id, nextStatus)} className="rounded bg-cyan-700 px-3 py-1 font-bold text-white text-[11px] hover:bg-cyan-800 transition-colors shadow-2xs whitespace-nowrap">
            Advance to {nextStatus} →
          </button>
        </div>)}

    </div>);
};
