import { createConfigParam } from '../../types/config';

// Table 15: Training
// Training converts unemployed workers into qualified salespeople or assembly workers.
// Training is more expensive than direct recruitment.
// A trained salesperson remains for at least one quarter after training.
// TODO: Populate exact training costs and recruitment advertising fees from Topaz Table 15
export const table15Training = {
  source: 'Topaz-VBE Table 15',
  status: 'PENDING_VERIFICATION' as const,
  salesRecruitmentFee: createConfigParam(
    1200,
    'Topaz Table 15',
    'PENDING_VERIFICATION',
    'Direct recruitment agency and search cost per salesperson',
    'currency'
  ),
  salesTrainingCost: createConfigParam(
    2800,
    'Topaz Table 15',
    'PENDING_VERIFICATION',
    'Comprehensive training cost per new salesperson (includes onboarding)',
    'currency'
  ),
  assemblyRecruitmentFee: createConfigParam(
    400,
    'Topaz Table 15',
    'PENDING_VERIFICATION',
    'Direct recruitment and induction fee per assembly worker',
    'currency'
  ),
  assemblyTrainingCost: createConfigParam(
    950,
    'Topaz Table 15',
    'PENDING_VERIFICATION',
    'Vocational training cost per new assembly operator',
    'currency'
  ),
  dismissalCompensationPerEmployee: createConfigParam(
    1500,
    'Topaz Table 15',
    'PENDING_VERIFICATION',
    'Statutory redundancy and severance compensation per dismissed employee',
    'currency'
  )
};

export const training = table15Training;

