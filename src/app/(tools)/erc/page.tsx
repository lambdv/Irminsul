import EnergyRechargeCalculator from "./energyRechargeCalculator";

export const metadata = {
  title: "Energy Recharge Calculator | Irminsul",
  description: "",
}

/** https://docs.google.com/spreadsheets/d/1-vkmgp5n0bI9pvhUg110Aza3Emb2puLWdeoCgrxDlu4/edit */

export default function Page() {
  return (
    <div>
      <EnergyRechargeCalculator />
    </div>
  );

}
