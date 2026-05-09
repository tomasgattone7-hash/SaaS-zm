import type { RoiInputs } from "../types/finance";

export const PILOT_RACKS = 7;
export const PILOT_CUTTING_ARS = 152445;
export const PILOT_EDGE_BANDING_ARS = 219703;
export const PILOT_TAX_ARS = 78151;
export const PILOT_OUTSOURCING_ARS =
  PILOT_CUTTING_ARS + PILOT_EDGE_BANDING_ARS + PILOT_TAX_ARS;

export type IndustrialRoiPoint = {
  month: number;
  cumulativeNetCashFlow: number;
  capexRecoveryLine: number;
};

export function buildOutsourcingProjection(inputs: RoiInputs) {
  const costPerRackArs = PILOT_OUTSOURCING_ARS / PILOT_RACKS;
  const monthlyArs = costPerRackArs * inputs.monthlyVolumeRacks;
  const annualArs = monthlyArs * 12;
  const fiveYearsArs = annualArs * 5;
  const monthlyUsd = inputs.exchangeRateArsUsd > 0 ? monthlyArs / inputs.exchangeRateArsUsd : 0;

  return {
    pilotRacks: PILOT_RACKS,
    pilotOutsourcingArs: PILOT_OUTSOURCING_ARS,
    costPerRackArs,
    monthlyArs,
    annualArs,
    fiveYearsArs,
    monthlyUsd,
    annualUsd: monthlyUsd * 12,
    fiveYearsUsd: monthlyUsd * 60,
  };
}

export function buildIndustrialRoiProjection(inputs: RoiInputs) {
  const grossMargin = inputs.grossMonthlyRevenueUsd - inputs.cogsUsd;
  const operatingCashFlow =
    grossMargin - inputs.incrementalOpexUsd - inputs.assignedFixedCostsUsd;
  const netCashFlow = operatingCashFlow - inputs.opportunityCostUsd;
  const isViable = netCashFlow > 0;
  const paybackMonths = isViable ? inputs.capex / netCashFlow : Number.POSITIVE_INFINITY;

  const points: IndustrialRoiPoint[] = Array.from(
    { length: Math.max(1, inputs.projectionMonths) },
    (_, index) => {
      const month = index + 1;
      return {
        month,
        cumulativeNetCashFlow: netCashFlow * month - inputs.capex,
        capexRecoveryLine: 0,
      };
    },
  );

  return {
    grossMargin,
    operatingCashFlow,
    netCashFlow,
    isViable,
    paybackMonths,
    points,
    projectedCashAtHorizon: points[points.length - 1]?.cumulativeNetCashFlow ?? -inputs.capex,
  };
}
