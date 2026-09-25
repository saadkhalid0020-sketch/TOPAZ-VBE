import { GameState } from '../types/game';

export interface DashboardMetrics {
  currentQuarterLabel: string;
  sharePrice: number;
  sharePriceDelta: number;
  cash: number;
  totalDebt: number;
  netWorth: number;
  lastQuarterRevenue: number;
  lastQuarterProfit: number;
  machineCapacity: number;
  activeEmployees: number;
  marketShare: number;
  inventoryTotal: number;
  alerts: Array<{ id: string; type: 'warning' | 'danger' | 'info' | 'success'; text: string }>;
}

export function selectDashboardMetrics(game: GameState): DashboardMetrics {
  const player = game.player;
  const history = game.history;
  const lastSnap = history[history.length - 1];
  const prevSnap = history.length > 1 ? history[history.length - 2] : null;

  const totalEmployees =
    player.employees.salespeople +
    player.employees.machinists +
    player.employees.assemblyWorkers +
    player.employees.ancillaryWorkers;

  const totalDebt = player.finance.currentOverdraft + player.finance.unsecuredLoans;
  const netWorth =
    player.finance.shareCapital +
    player.finance.retainedEarnings +
    player.finance.lastQuarterNetProfit;

  const sharePrice = player.sharePrice;
  const sharePriceDelta = prevSnap ? sharePrice - prevSnap.sharePrice : 0;

  const alerts: Array<{ id: string; type: 'warning' | 'danger' | 'info' | 'success'; text: string }> = [];

  // Critical Alerts Checks
  if (player.finance.unsecuredLoans > 0) {
    alerts.push({
      id: 'unsecured-debt',
      type: 'danger',
      text: `High Unsecured Borrowing ($${player.finance.unsecuredLoans.toLocaleString()}) incurring penalty interest at ${((player.finance.unsecuredRate) * 100).toFixed(1)}%.`,
    });
  } else if (player.finance.currentOverdraft > player.finance.overdraftLimit * 0.8) {
    alerts.push({
      id: 'high-overdraft',
      type: 'warning',
      text: `Overdraft drawing near limit ($${player.finance.currentOverdraft.toLocaleString()} / $${player.finance.overdraftLimit.toLocaleString()}).`,
    });
  }

  // Check pending major R&D improvements
  for (const prod of player.products) {
    if (prod.pendingMajorImprovementAvailable) {
      alerts.push({
        id: `rd-breakthrough-${prod.id}`,
        type: 'success',
        text: `R&D Breakthrough! Major redesign ready for ${prod.name}. Review Marketing tab to adopt.`,
      });
    }
  }

  // Machine breakdown / efficiency alert
  const lowEfficiencyMachines = player.machines.filter(m => m.efficiency < 0.90);
  if (lowEfficiencyMachines.length > 0) {
    alerts.push({
      id: 'machine-efficiency',
      type: 'warning',
      text: `${lowEfficiencyMachines.length} machine(s) have efficiency below 90%. Increase contracted maintenance hours.`,
    });
  }

  // Backlog alert
  const totalBacklog = player.products.reduce((acc, p) => acc + p.backlog, 0);
  if (totalBacklog > 150) {
    alerts.push({
      id: 'high-backlog',
      type: 'warning',
      text: `High customer backlog (${totalBacklog.toLocaleString()} units). Increase production schedule or shifts.`,
    });
  }

  // Raw material shortage alert
  if (player.materials.currentStockUnits < 1500) {
    alerts.push({
      id: 'low-materials',
      type: 'warning',
      text: `Raw material inventory low (${player.materials.currentStockUnits.toLocaleString()} units). Place orders in Operations.`,
    });
  }

  return {
    currentQuarterLabel: `Year ${game.year}, Quarter ${game.quarter}`,
    sharePrice,
    sharePriceDelta,
    cash: player.cash,
    totalDebt,
    netWorth,
    lastQuarterRevenue: lastSnap?.revenue ?? 165000,
    lastQuarterProfit: lastSnap?.profit ?? 18500,
    machineCapacity: player.machines.length * 500,
    activeEmployees: totalEmployees,
    marketShare: lastSnap?.marketShare ?? 0.25,
    inventoryTotal: player.materials.currentStockUnits,
    alerts,
  };
}
