"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DisclaimerBanner } from "@/components/shared/disclaimer-banner";
import { BmiIbwCalculator, WeightDoseCalculator, InfusionRateCalculator } from "@/components/calculators/anthropometric-calculators";
import { MaintenanceFluidsCalculator, NpoDeficitCalculator, ParklandCalculator, BloodLossCalculator } from "@/components/calculators/fluids-calculators";
import { MapCalculator, AnionGapCalculator, CorrectedSodiumCalculator, CorrectedCalciumCalculator, AaGradientCalculator } from "@/components/calculators/labs-calculators";
import { EttSizingCalculator, LmaSizingReference } from "@/components/calculators/airway-calculators";
import {
  GcsCalculator,
  ApfelCalculator,
  RcriCalculator,
  StopBangCalculator,
  ChildPughCalculator,
  MeldCalculator,
  News2Calculator,
  SofaCalculator,
  QsofaCalculator,
  AsaPsReference,
} from "@/components/calculators/risk-score-calculators";
import {
  LungProtectiveTvCalculator,
  PfRatioCalculator,
  SfRatioCalculator,
  OxygenationIndexCalculator,
  DrivingPressureCalculator,
  MinuteVentilationCalculator,
  CrrtDoseCalculator,
  NorepiEquivalentCalculator,
} from "@/components/calculators/icu-calculators";
import { LaMaxDoseCalculator } from "@/components/calculators/regional-calculators";

export default function CalculatorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Calculators</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Every result here comes from a fixed, published formula — the calculators tab has no drug-dose
          judgement calls in it, only arithmetic. Cross-check inputs against the patient chart.
        </p>
      </div>

      <DisclaimerBanner compact />

      <Tabs defaultValue="dosing">
        <TabsList>
          <TabsTrigger value="dosing">Dosing</TabsTrigger>
          <TabsTrigger value="fluids">Fluids</TabsTrigger>
          <TabsTrigger value="labs">Hemodynamics & Labs</TabsTrigger>
          <TabsTrigger value="airway">Airway</TabsTrigger>
          <TabsTrigger value="risk">Risk Scores</TabsTrigger>
          <TabsTrigger value="icu">ICU & Vent</TabsTrigger>
          <TabsTrigger value="regional">Regional</TabsTrigger>
        </TabsList>

        <TabsContent value="dosing" className="space-y-4">
          <BmiIbwCalculator />
          <WeightDoseCalculator />
          <InfusionRateCalculator />
        </TabsContent>

        <TabsContent value="fluids" className="space-y-4">
          <MaintenanceFluidsCalculator />
          <NpoDeficitCalculator />
          <ParklandCalculator />
          <BloodLossCalculator />
        </TabsContent>

        <TabsContent value="labs" className="space-y-4">
          <MapCalculator />
          <AnionGapCalculator />
          <CorrectedSodiumCalculator />
          <CorrectedCalciumCalculator />
          <AaGradientCalculator />
        </TabsContent>

        <TabsContent value="airway" className="space-y-4">
          <EttSizingCalculator />
          <LmaSizingReference />
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <GcsCalculator />
          <ApfelCalculator />
          <RcriCalculator />
          <StopBangCalculator />
          <ChildPughCalculator />
          <MeldCalculator />
          <News2Calculator />
          <SofaCalculator />
          <QsofaCalculator />
          <AsaPsReference />
        </TabsContent>

        <TabsContent value="icu" className="space-y-4">
          <LungProtectiveTvCalculator />
          <PfRatioCalculator />
          <SfRatioCalculator />
          <OxygenationIndexCalculator />
          <DrivingPressureCalculator />
          <MinuteVentilationCalculator />
          <CrrtDoseCalculator />
          <NorepiEquivalentCalculator />
        </TabsContent>

        <TabsContent value="regional" className="space-y-4">
          <LaMaxDoseCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
