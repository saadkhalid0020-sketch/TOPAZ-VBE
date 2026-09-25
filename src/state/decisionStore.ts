import { create } from 'zustand';
import { QuarterlyDecisions, MarketingDecisions, OperationsDecisions, PersonnelDecisions, FinanceDecisions, ResearchDecisions } from '../types/decisions';
import { CompanyState } from '../types/company';
import { createDefaultQuarterlyDecisions } from '../data/scenarios/initialGame';
import { validateDecisions, ValidationResult } from '../utils/validation';

interface DecisionStoreState {
  draftDecisions: QuarterlyDecisions;
  validationResult: ValidationResult;
  isDirty: boolean;
  
  // Actions
  initializeDraft: (company: CompanyState, quarter: 1 | 2 | 3 | 4) => void;
  updateMarketing: (updater: (prev: MarketingDecisions) => MarketingDecisions, company: CompanyState, quarter: 1 | 2 | 3 | 4) => void;
  updateOperations: (updater: (prev: OperationsDecisions) => OperationsDecisions, company: CompanyState, quarter: 1 | 2 | 3 | 4) => void;
  updatePersonnel: (updater: (prev: PersonnelDecisions) => PersonnelDecisions, company: CompanyState, quarter: 1 | 2 | 3 | 4) => void;
  updateFinance: (updater: (prev: FinanceDecisions) => FinanceDecisions, company: CompanyState, quarter: 1 | 2 | 3 | 4) => void;
  updateResearch: (updater: (prev: ResearchDecisions) => ResearchDecisions, company: CompanyState, quarter: 1 | 2 | 3 | 4) => void;
  resetDecisions: (company: CompanyState, quarter: 1 | 2 | 3 | 4) => void;
}

const dummyCompany: any = {
  employees: { salespeople: 8, assemblyWorkers: 20, assemblyHourlyWage: 10.50 },
  products: [{ id: 'product1', inventory: 100 }, { id: 'product2', inventory: 100 }, { id: 'product3', inventory: 100 }],
  warehouses: [{ marketId: 'south', stock: { product1: 100, product2: 100, product3: 100 } }],
  finance: { retainedEarnings: 50000 },
};

const initialDefault = createDefaultQuarterlyDecisions(dummyCompany);

export const useDecisionStore = create<DecisionStoreState>((set, get) => ({
  draftDecisions: initialDefault,
  validationResult: { isValid: true, errors: [], warnings: [] },
  isDirty: false,

  initializeDraft: (company, quarter) => {
    const draft = createDefaultQuarterlyDecisions(company);
    const validation = validateDecisions(draft, company, quarter);
    set({
      draftDecisions: draft,
      validationResult: validation,
      isDirty: false,
    });
  },

  updateMarketing: (updater, company, quarter) => {
    const nextMarketing = updater(get().draftDecisions.marketing);
    const updated = {
      ...get().draftDecisions,
      marketing: nextMarketing,
    };
    const validation = validateDecisions(updated, company, quarter);
    set({ draftDecisions: updated, validationResult: validation, isDirty: true });
  },

  updateOperations: (updater, company, quarter) => {
    const nextOps = updater(get().draftDecisions.operations);
    const updated = {
      ...get().draftDecisions,
      operations: nextOps,
    };
    const validation = validateDecisions(updated, company, quarter);
    set({ draftDecisions: updated, validationResult: validation, isDirty: true });
  },

  updatePersonnel: (updater, company, quarter) => {
    const nextPers = updater(get().draftDecisions.personnel);
    const updated = {
      ...get().draftDecisions,
      personnel: nextPers,
    };
    const validation = validateDecisions(updated, company, quarter);
    set({ draftDecisions: updated, validationResult: validation, isDirty: true });
  },

  updateFinance: (updater, company, quarter) => {
    const nextFin = updater(get().draftDecisions.finance);
    const updated = {
      ...get().draftDecisions,
      finance: nextFin,
    };
    const validation = validateDecisions(updated, company, quarter);
    set({ draftDecisions: updated, validationResult: validation, isDirty: true });
  },

  updateResearch: (updater, company, quarter) => {
    const nextRes = updater(get().draftDecisions.research);
    const updated = {
      ...get().draftDecisions,
      research: nextRes,
    };
    const validation = validateDecisions(updated, company, quarter);
    set({ draftDecisions: updated, validationResult: validation, isDirty: true });
  },

  resetDecisions: (company, quarter) => {
    const draft = createDefaultQuarterlyDecisions(company);
    const validation = validateDecisions(draft, company, quarter);
    set({ draftDecisions: draft, validationResult: validation, isDirty: false });
  },
}));
