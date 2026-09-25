import { createConfigParam } from '../../types/config';

// Table 3: Manufacturing Requirements
// TODO: Populate exact material units and standard assembly minutes from Topaz Table 3
export const table03ManufacturingRequirements = {
  source: 'Topaz-VBE Table 3',
  status: 'PENDING_VERIFICATION' as const,
  product1: {
    basicMaterialUnits: createConfigParam(
      1.0,
      'Topaz Table 3',
      'PENDING_VERIFICATION',
      'Basic material units needed per unit of Product 1'
    ),
    standardAssemblyMinutes: createConfigParam(
      45,
      'Topaz Table 3',
      'PENDING_VERIFICATION',
      'Standard assembly time in minutes for Product 1'
    ),
    machiningHoursPerUnit: createConfigParam(
      0.5,
      'Topaz Table 3',
      'PENDING_VERIFICATION',
      'Machining time in hours required per unit of Product 1'
    )
  },
  product2: {
    basicMaterialUnits: createConfigParam(
      1.5,
      'Topaz Table 3',
      'PENDING_VERIFICATION',
      'Basic material units needed per unit of Product 2'
    ),
    standardAssemblyMinutes: createConfigParam(
      60,
      'Topaz Table 3',
      'PENDING_VERIFICATION',
      'Standard assembly time in minutes for Product 2'
    ),
    machiningHoursPerUnit: createConfigParam(
      0.75,
      'Topaz Table 3',
      'PENDING_VERIFICATION',
      'Machining time in hours required per unit of Product 2'
    )
  },
  product3: {
    basicMaterialUnits: createConfigParam(
      2.0,
      'Topaz Table 3',
      'PENDING_VERIFICATION',
      'Basic material units needed per unit of Product 3'
    ),
    standardAssemblyMinutes: createConfigParam(
      90,
      'Topaz Table 3',
      'PENDING_VERIFICATION',
      'Standard assembly time in minutes for Product 3'
    ),
    machiningHoursPerUnit: createConfigParam(
      1.0,
      'Topaz Table 3',
      'PENDING_VERIFICATION',
      'Machining time in hours required per unit of Product 3'
    )
  }
};

export const manufacturingRequirements = table03ManufacturingRequirements;

