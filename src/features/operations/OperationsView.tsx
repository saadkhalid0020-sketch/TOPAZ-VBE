import React from 'react';
import { useGameStore } from '../../state/gameStore';
import { useDecisionStore } from '../../state/decisionStore';
import { ProductId } from '../../types/product';
import { MarketId } from '../../types/market';
import { SUPPLIER_DEFINITIONS } from '../../data/suppliers';
import { table18MachinesVehicles } from '../../data/tables/machinesVehicles';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/rounding';

export const OperationsView: React.FC = () => {
  const { game } = useGameStore();
  const { draftDecisions, updateOperations } = useDecisionStore();
  const player = game.player;

  const products: ProductId[] = ['product1', 'product2', 'product3'];
  const markets: MarketId[] = ['south', 'west', 'north', 'export'];

  // Calculate machine creditworthiness
  const outstandingMachinePayments = player.operations.machineOrdersPipeline.reduce((acc, p) => {
    if (!p.firstPaymentPaid) return acc + p.totalCost;
    if (!p.secondPaymentPaid) return acc + p.totalCost * 0.5;
    return acc;
  }, 0);

  const machineCreditworthiness = Math.max(
    0,
    player.finance.overdraftLimit -
      player.finance.currentOverdraft -
      player.finance.unsecuredLoans -
      outstandingMachinePayments
  );

  const maxMachinesAllowedToOrder = Math.floor(machineCreditworthiness / table18MachinesVehicles.machineCostNew.value);

  // Material supplier calculation
  const currentSupplierId = draftDecisions.operations.materialOrder.supplierId;
  const currentSupplier = SUPPLIER_DEFINITIONS[currentSupplierId];
  const orderUnits = draftDecisions.operations.materialOrder.units;

  let discountRate = 0;
  for (const tier of currentSupplier.volumeDiscounts) {
    if (orderUnits >= tier.threshold) {
      discountRate = Math.max(discountRate, tier.discountPercent);
    }
  }
  const estimatedMaterialCost = orderUnits * currentSupplier.basePrice * (1 - discountRate);

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/60">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Factory Operations & Logistics</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage factory shift levels, machine maintenance, assembly quality tradeoffs, material procurement, and distribution schedules.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs bg-slate-950/80 px-4 py-2 rounded-lg border border-slate-800">
          <div>
            <span className="text-slate-400">Active Machines:</span>
            <div className="font-bold text-white text-sm">{player.machines.length} Units</div>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-slate-400">Raw Material Stock:</span>
            <div className="font-bold text-indigo-300 text-sm">{player.materials.currentStockUnits.toLocaleString()} Units</div>
          </div>
        </div>
      </div>

      {/* Production Delivery Scheduling Table */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Planned Delivery Schedule</h3>
            <p className="text-[11px] text-slate-400">Positive values deliver units to warehouses. Negative values transfer excess warehouse inventory back or to other markets.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5">Product</th>
                <th className="py-2.5">South (Factory)</th>
                <th className="py-2.5">West</th>
                <th className="py-2.5">North</th>
                <th className="py-2.5">Export</th>
                <th className="py-2.5">Total Scheduled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {products.map((prodId) => {
                const prod = player.products.find((p) => p.id === prodId);
                const deliveries = draftDecisions.operations.deliveryQuantities[prodId];
                const totalScheduled =
                  (deliveries?.south || 0) +
                  (deliveries?.west || 0) +
                  (deliveries?.north || 0) +
                  (deliveries?.export || 0);

                return (
                  <tr key={prodId}>
                    <td className="py-3 font-semibold text-white">
                      {prod?.name}
                      <div className="text-[10px] text-slate-400">Inventory: {prod?.inventory.toLocaleString()}</div>
                    </td>
                    {markets.map((mkt) => {
                      const warehouse = player.warehouses.find((w) => w.marketId === mkt);
                      const currentStock = warehouse?.stock[prodId] || 0;
                      return (
                        <td key={mkt} className="py-3">
                          <input
                            type="number"
                            step="50"
                            value={deliveries?.[mkt] ?? 0}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              updateOperations(
                                (prev) => ({
                                  ...prev,
                                  deliveryQuantities: {
                                    ...prev.deliveryQuantities,
                                    [prodId]: {
                                      ...prev.deliveryQuantities[prodId],
                                      [mkt]: val,
                                    },
                                  },
                                }),
                                player,
                                game.quarter
                              );
                            }}
                            className="w-24 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white font-semibold focus:outline-none focus:border-indigo-500"
                          />
                          <div className="text-[10px] text-slate-500 mt-0.5">Stock: {currentStock}</div>
                        </td>
                      );
                    })}
                    <td className="py-3 font-bold text-indigo-300">
                      {totalScheduled.toLocaleString()} units
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assembly Time vs Quality Tradeoff & Shifts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assembly Time Tradeoff */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Assembly Time & Quality Tradeoff</h3>
            <Badge variant="indigo">One Day Shift</Badge>
          </div>
          <p className="text-xs text-slate-400">
            Allowing more assembly time reduces defects and increases quality score, but consumes worker hours and lowers maximum plant capacity.
          </p>

          <div className="space-y-4 pt-2">
            {products.map((prodId) => {
              const stdMinutes = prodId === 'product1' ? 45 : prodId === 'product2' ? 60 : 90;
              const currentMin = draftDecisions.operations.assemblyTimeMinutes[prodId] || stdMinutes;
              const extraMin = currentMin - stdMinutes;

              return (
                <div key={prodId} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-white capitalize">{prodId} Assembly Duration:</span>
                    <span className="text-indigo-400">{currentMin} Minutes (Std: {stdMinutes} min {extraMin > 0 ? `+${extraMin}m extra` : ''})</span>
                  </div>
                  <input
                    type="range"
                    min={stdMinutes}
                    max={stdMinutes + 30}
                    step="1"
                    value={currentMin}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      updateOperations(
                        (prev) => ({
                          ...prev,
                          assemblyTimeMinutes: {
                            ...prev.assemblyTimeMinutes,
                            [prodId]: val,
                          },
                        }),
                        player,
                        game.quarter
                      );
                    }}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="text-[10px] text-slate-400 flex justify-between">
                    <span>Quality Boost: +{(extraMin * 0.4).toFixed(1)} pts</span>
                    <span>Defect Reduction: -{(extraMin * 0.15).toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Factory Shifts & Maintenance Controls */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Shifts & Machinery Maintenance</h3>

          <div className="space-y-4 text-xs">
            {/* Shifts */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Factory Operational Shifts</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((shiftNum) => {
                  const isSelected = draftDecisions.operations.shifts === shiftNum;
                  return (
                    <button
                      key={shiftNum}
                      type="button"
                      onClick={() =>
                        updateOperations(
                          (prev) => ({ ...prev, shifts: shiftNum as 1 | 2 | 3 }),
                          player,
                          game.quarter
                        )
                      }
                      className={`py-2 px-3 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-950/60 text-white'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      {shiftNum} Shift{shiftNum > 1 ? 's' : ''}
                      <div className="text-[10px] font-normal text-slate-400">
                        {shiftNum * 4 * player.machines.length} Machinists
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Note: Machinists are automatically recruited (4 machinists per machine per shift).</p>
            </div>

            {/* Maintenance */}
            <div className="pt-3 border-t border-slate-800">
              <label className="block text-slate-300 font-semibold mb-1">
                Contracted Maintenance Hours per Machine
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="2"
                  value={draftDecisions.operations.contractedMaintenanceHoursPerMachine}
                  onChange={(e) => {
                    const val = Math.max(0, parseInt(e.target.value) || 0);
                    updateOperations(
                      (prev) => ({ ...prev, contractedMaintenanceHoursPerMachine: val }),
                      player,
                      game.quarter
                    );
                  }}
                  className="w-24 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white font-semibold focus:outline-none focus:border-indigo-500"
                />
                <span className="text-slate-400">hours/machine @ $35/hr</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Maintenance repairs breakdowns first; remainder restores machine efficiency. If breakdowns exceed contracted hours, emergency repair hours cost $75/hr.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Raw Material Purchasing & Supplier Selection */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Raw Material Sourcing & Purchasing</h3>
          <Badge variant="emerald">Stock: {player.materials.currentStockUnits.toLocaleString()} units</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((sId) => {
            const supp = SUPPLIER_DEFINITIONS[sId as 0 | 1 | 2 | 3];
            const isSelected = currentSupplierId === sId;
            return (
              <div
                key={sId}
                onClick={() =>
                  updateOperations(
                    (prev) => ({
                      ...prev,
                      materialOrder: { ...prev.materialOrder, supplierId: sId as 0 | 1 | 2 | 3 },
                    }),
                    player,
                    game.quarter
                  )
                }
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-white mb-1">
                  <span>Supplier {sId}</span>
                  <span className="text-indigo-400">${supp.basePrice.toFixed(2)}/unit</span>
                </div>
                <div className="text-slate-300 font-medium mb-1">{supp.name}</div>
                <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">{supp.description}</p>
                <div className="text-[10px] text-slate-500">
                  {supp.volumeDiscounts.length > 0 ? (
                    <span>Discounts up to {(supp.volumeDiscounts[supp.volumeDiscounts.length - 1].discountPercent * 100).toFixed(0)}%</span>
                  ) : (
                    <span>Zero warehouse storage cost</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
          <div className="flex items-center gap-3">
            <label className="text-slate-300 font-semibold">Material Units to Order:</label>
            <input
              type="number"
              step="500"
              min="0"
              max="50000"
              value={orderUnits}
              onChange={(e) => {
                const val = Math.max(0, parseInt(e.target.value) || 0);
                updateOperations(
                  (prev) => ({
                    ...prev,
                    materialOrder: { ...prev.materialOrder, units: val },
                  }),
                  player,
                  game.quarter
                );
              }}
              className="w-32 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-semibold focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-400">Volume Discount: </span>
              <strong className="text-emerald-400">{(discountRate * 100).toFixed(1)}%</strong>
            </div>
            <div>
              <span className="text-slate-400">Estimated Cost: </span>
              <strong className="text-white text-sm">{formatCurrency(estimatedMaterialCost)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Capital Equipment & Machinery Pipeline */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Machinery & Fleet Capital Investment</h3>
          <Badge variant={machineCreditworthiness > 50000 ? 'indigo' : 'amber'}>
            Credit Capacity: {formatCurrency(machineCreditworthiness)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Machine Ordering */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
            <div className="font-bold text-white flex justify-between">
              <span>Industrial Machinery ($50,000 / machine)</span>
              <span className="text-slate-400">Allowed: max {maxMachinesAllowedToOrder}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Multi-quarter delivery sequence: Ordered in Q(T), 50% paid in Q(T+1), 50% paid + installation in Q(T+2), operational in Q(T+3).
            </p>

            <div className="flex items-center gap-3">
              <label className="text-slate-300">Order New Machines:</label>
              <input
                type="number"
                min="0"
                max={maxMachinesAllowedToOrder}
                value={draftDecisions.operations.machinesToOrder}
                onChange={(e) => {
                  const val = Math.max(0, Math.min(maxMachinesAllowedToOrder, parseInt(e.target.value) || 0));
                  updateOperations(
                    (prev) => ({ ...prev, machinesToOrder: val }),
                    player,
                    game.quarter
                  );
                }}
                className="w-20 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>

            {player.operations.machineOrdersPipeline.length > 0 && (
              <div className="pt-2 border-t border-slate-800">
                <span className="font-semibold text-amber-300">Active Machine Delivery Pipeline:</span>
                <ul className="mt-1 space-y-1 text-[11px] text-slate-400">
                  {player.operations.machineOrdersPipeline.map((pipe) => (
                    <li key={pipe.id}>
                      • Order {pipe.id}: {pipe.quantity} unit(s) • Operational Y{pipe.operationalQuarter.year} Q{pipe.operationalQuarter.quarter}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Delivery Vehicle Purchasing */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
            <div className="font-bold text-white flex justify-between">
              <span>Distribution Vehicles ($24,000 / vehicle)</span>
              <span className="text-slate-400">Current Fleet: {player.vehicles.length}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Company-owned vehicles reduce reliance on expensive hired lorries during peak quarterly distributions. Purchased vehicles become available at start of next quarter.
            </p>

            <div className="flex items-center gap-3">
              <label className="text-slate-300">Buy Vehicles:</label>
              <input
                type="number"
                min="0"
                max="5"
                value={draftDecisions.operations.vehiclesToBuy}
                onChange={(e) => {
                  const val = Math.max(0, parseInt(e.target.value) || 0);
                  updateOperations(
                    (prev) => ({ ...prev, vehiclesToBuy: val }),
                    player,
                    game.quarter
                  );
                }}
                className="w-20 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
